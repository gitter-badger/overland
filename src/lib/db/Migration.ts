/// <reference path="../../../typings/index.d.ts" />
import * as deepEqual from 'deep-equal';
import * as chalk from 'chalk';
import * as Operations from './operations';
import * as inquirer from 'inquirer';
import * as Knex from 'knex';
import { deep } from 'cloner';
import * as debugFn from 'debug';
import { IMigrationOperation, IModelSchema, IDBSchema, IMigrationSchema, ITypedHash } from '../interfaces';

const debug = debugFn('overland:migrations');

// A slimmed-down array#includes, using deepEquals for comparisons.
function deepIncludes(array: any[], item: any) {
  if (array.length === 0) {
    return false;
  }
  let k = 0;
  while (k < array.length) {
    if (deepEqual(array[k], item)) {
      return true;
    } else {
      k++;
    }
  }
  return false;
}

export default class Migration {

  public static silent = false;

  public static async run(knex: Knex, ...ops: IMigrationOperation[][]): Promise<any> {
    return await ops.reduce((a, b) => a.concat(b), [])
      .reduce((a: Knex.SchemaBuilder, b) => b.execute(a), knex.schema);
  }

  public static log(message: any) {
    if (!Migration.silent) {
      console.log(message);
    }
  }

  // Returns an inquirer prompt, wrapped in a promise - allows us to hang execution of the loopy-whoopy things without blocking.
  public static prompt(question: inquirer.Question): Promise<any> {
    return new Promise((resolve, reject) => inquirer.prompt([question], answers => resolve(answers)));
  }

  // Filters out the fields proprty of a table, mappable or not.
  public static filterFields(arr) {
    const _filterFields = (schema: IModelSchema): IModelSchema => {
      return {
        app: schema.app,
        name: schema.name,
        tableName: schema.tableName
      };
    };
    return Array.isArray(arr) ? arr.map(_filterFields) : _filterFields(arr);
  }

  // The old version of the schema.
  public oldSchema: IDBSchema;
  // The new version of the schema.
  public newSchema: IDBSchema;

  public async up(): Promise<IMigrationOperation[]> {
    debug(`generating up schemas for migration`);
    const migration = await this.schema();
    debug('generated up schemas for migration');
    return this._generateOps(migration, this.newSchema);
  }

  public async down(): Promise<IMigrationOperation[]> {
    debug(`generating up down for migration`);
    const migration = await this.schema();
    return this._generateOps(migration, this.oldSchema, true);
  }

  public async schema(): Promise<IMigrationSchema> {

    // Object.assign() shallow copies
    const oldassign = deep.copy(this.oldSchema);
    const newassign = deep.copy(this.newSchema);

    const ops = [
      this._generateRenamedModels,
      this._generateDeletedModels,
      this._generateAddedModels,
      this._generateRenamedFields,
      this._generateDeletedFields,
      this._generateAddedFields,
      this._generateJoinModels,
      this._generateJoinFields
    ];

    const res: IMigrationSchema = {
      fields: {
        added: {},
        altered: {},
        deleted: {}
      },
      models: {
        added: {},
        altered: {},
        deleted: {}
      }
    };

    return ops.reduce(async function (a, b) {
      return b(oldassign, newassign, await a);
    }, Promise.resolve(res));
  }

  protected async _generateJoinModels(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema) {

    debug('generating joined models');
    const oldNameHash = {};
    const newNameHash = {};

    // returns array of MTM join fields
    const [oldJoin, newJoin] = [oldSchema, newSchema]
      .map(s => s.tables
        .filter(t => t.fields.some(f => f.fk && !!f.fk.through))
        .map(t => t.fields.filter(f => f.fk && !!f.fk.through))
        .reduce((a, b) => a.concat(b), []));

    oldJoin.map(f => f.fk.through.from.split('.')[0])
      .forEach(name => (oldNameHash[name] = true));

    newJoin.map(f => f.fk.through.from.split('.')[0])
      .forEach(name => (newNameHash[name] = true));

    const oldNames = Object.keys(oldNameHash);
    const newNames = Object.keys(newNameHash);
    const addedNames = newNames.filter(n => oldNames.indexOf(n) < 0);

    addedNames.forEach(model => {
      // const app = model.split('_')[0];
      // const name = model;
      // const tableName = model;
      // newSchema.tables.push({ oldTableName: null, tableName, app, name, fields: [] });
      res.models.added[model] = true;
    });

    return res;
  }

  protected async _generateJoinFields(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema) {
    return res;
  }

  protected async _generateAddedModels(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema): Promise<IMigrationSchema> {
    const added: ITypedHash<boolean> = {};
    debug('generating added models');

    newSchema.tables.filter(i => !i.renamed)
      .filter(i => !deepIncludes(oldSchema.tables.map(Migration.filterFields), Migration.filterFields(i)))
      .forEach(model => {
        model.added = true;
        added[model.tableName] = true;
      });

    res.models.added = added;
    return res;
  }

  protected async _generateDeletedModels(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema): Promise<IMigrationSchema> {

    const removedModels: ITypedHash<boolean> = {};
    const dropModels = oldSchema.tables.filter(i => !i.renamed)
      .filter(i => !deepIncludes(newSchema.tables.map(Migration.filterFields), Migration.filterFields(i)));

    for (const model of dropModels) {
      const result = await Migration.prompt({
        message: `Did you delete this model? (${ model.name })`,
        name: 'drop',
        type: 'confirm',
      });
      if (result.drop) {
        model.deleted = true;
        removedModels[model.tableName] = true;
      }
    }
    res.models.deleted = removedModels;
    return res;
  }

  protected async _generateRenamedModels(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema): Promise<IMigrationSchema> {

    debug('processing renamed models');

    // Create a hash of renamed models.
    const one = oldSchema;
    const two = newSchema;

    // Retrives models not in the original set that are in the new one.
    const filterFn = array => i => !deepIncludes(array.map(Migration.filterFields), Migration.filterFields(i));

    const addedModels = two.tables.filter(filterFn(one.tables));

    for (const model of addedModels) {
      // Retrives models not in the new set that are in the original.
      const removedModels = one.tables.filter(filterFn(two.tables));
      // for each of the removed models...
      for (const rModel of removedModels) {
        // makes sure they're in the same app.
        if (rModel.app === model.app && !rModel.renamed) {

          // get the fields from each model and start a counter.
          const addedFields = model.fields;
          const removedFields = rModel.fields;
          let matchedFields = 0;

          for (const field of removedFields) {
            // check to see if we can find a matching field.
            const matchingField = addedFields.find(f => {
              // Copy the original without the 'name' prop.
              const sansName = [field, f].map(({ opts, type, fk }) => ({ type, fk, opts }));

              // 1. If the names match, consider it a match.
              // 2. If the contents of the removed field (sans name, assuming
              // we've renamed it) pass a deepEqual test with the added field,
              // consider it a match ONLY IF another new field doesn't share the
              // name of the removed field
              return f.name === field.name || deepEqual(...sansName);
            });
            // If we matched, increments the matching fields counter.
            matchedFields += (matchingField === undefined ? 0 : 1);
          }

          // If over half the old fields have a match in the new table, consider
          // it a potential match and ask the user for confirmation.
          if (matchedFields > removedFields.length / 2) {
            const result = await Migration.prompt({
              message: `Did you rename this model? (${rModel.name} => ${model.name})`,
              name: `rename`,
              type: 'confirm'
            });
            if (result.rename) {
              res.models.altered[rModel.tableName] = model.tableName;
              rModel.renamed = true;
              model.renamed = true;
              model.oldTableName = rModel.tableName;
            }
          }
        }
      }
    }

    return res;
  }

  protected async _generateAddedFields(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema): Promise<IMigrationSchema> {
    const addedFields: ITypedHash<ITypedHash<boolean>> = {};

    debug('processing added fields');

    for (const model of newSchema.tables) {

      debug(`\tfor model ${model.name}`);

      addedFields[model.tableName] = {};

      const oldModel = oldSchema.tables.find(f => {
        const renamed = f.tableName === model.oldTableName;
        const sameName = f.tableName === model.tableName;
        return model.renamed ? renamed : sameName;
      }) || { fields: [] };

      model.fields.filter(f => !deepIncludes(oldModel.fields, f))
        .filter(field => !field.renamed)
        .forEach(field => {
          field.added = true;
          addedFields[model.tableName][field.name] = true;
        });

      if (Object.keys(addedFields[model.tableName]).length === 0) {
        delete addedFields[model.tableName];
      }
    }
    res.fields.added = addedFields;
    return res;
  }

  protected async _generateDeletedFields(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema): Promise<IMigrationSchema> {
    const removedFields: ITypedHash<ITypedHash<boolean>> = {};
    const previouslyExtantModels = newSchema.tables.filter(model => !model.added);

    for (const model of previouslyExtantModels) {
      removedFields[model.tableName] = {};

      const oldModel = oldSchema.tables.find(f => {
        const renamed = f.tableName === model.oldTableName;
        const sameName = f.tableName === model.tableName;
        return model.renamed ? renamed : sameName;
      });

      const dropFields = oldModel.fields
        .filter(f => !deepIncludes(model.fields, f))
        .filter(field => !field.renamed && !field.deleted);

      for (const field of dropFields) {
        const result = await Migration.prompt({
          message: `Did you delete this field? (${model.name}.${field.name})`,
          name: 'drop',
          type: 'confirm',
        });
        if (result.drop) {
          field.deleted = true;
          removedFields[model.tableName][field.name] = true;
        }
      }
      if (Object.keys(removedFields[model.tableName]).length === 0) {
        delete removedFields[model.tableName];
      }
    }
    res.fields.deleted = removedFields;
    return res;
  }

  protected async _generateRenamedFields(oldSchema: IDBSchema, newSchema: IDBSchema, res: IMigrationSchema) {
    const previouslyExtantModels = newSchema.tables.filter(model => !model.added);
    const renamedFields: ITypedHash<ITypedHash<string>> = {};

    for (const model of previouslyExtantModels) {

      // Clear a space for the model in the renamedFields hash.
      renamedFields[model.tableName] = {};

      // find corresponding model - via the old tableName if it's been renamed, by the current table name if not.
      const oldModel = oldSchema.tables.find(f => {
        const renamed = f.tableName === model.oldTableName;
        const sameName = f.tableName === model.tableName;
        return model.renamed ? renamed : sameName;
      });

      const addedFields = model.fields
        .filter(f => !deepIncludes(oldModel.fields, f));

      const removedFields = oldModel.fields
        .filter(f => !deepIncludes(model.fields, f));

      for (const field of addedFields) {
        for (const rField of removedFields) {
          // @todo currently assume a type change is a drop/re-add.
          if (field.type === rField.type) {
            if (field.name === rField.name) {
              // WE'RE ALTERING, HOLD ONTO YOUR BUTTS
              const fkOK = deepEqual(field.fk, rField.fk);
              const optOK = deepEqual(field.opts, rField.opts);
              if (!optOK) {
                // Unsupported by Knex
                Migration.log(chalk.white(`Knex does not currently support column-level alterations.`));
              }
              if (!fkOK) {
                const updateOK = deepEqual(field.fk.onUpdate, rField.fk.onUpdate);
                const deleteOK = deepEqual(field.fk.onDelete, rField.fk.onDelete);
                if (!updateOK || !deleteOK) {
                  Migration.log(chalk.white(`Knex does not currently support column-level alterations.`));
                }
                // Could be a table-pointy issue.
                if (field.fk.inTable !== rField.fk.inTable) {
                  const currentVersionOfTable = newSchema.tables.find(t => t.oldTableName === rField.fk.inTable);
                  if (currentVersionOfTable) {
                    rField.renamed = true;
                    field.renamed = true;
                    field.oldFieldName = rField.name;
                    Migration.log(chalk.grey(`  Foreign key '${ field.name }' pointing to renamed table. A-OK.`));
                  }
                }
              }
            } else {
              const result = await Migration.prompt({
                message: `Did you rename this field? (${ oldModel.name }.${ rField.name } => ${ model.name }.${ field.name })`,
                name: 'rename',
                type: 'confirm'
              });
              if (result.rename) {
                renamedFields[model.tableName][rField.name] = field.name;
                rField.renamed = true;
                field.renamed = true;
                field.oldFieldName = rField.name;
              }
            }
          }
        }
      }
      if (Object.keys(renamedFields[model.tableName]).length === 0) {
        delete renamedFields[model.tableName];
      }
    }
    res.fields.altered = renamedFields;
    return res;
  }

  private _generateOps(migration: IMigrationSchema, schema: IDBSchema, down?: boolean): IMigrationOperation[] {

    const modelAdds = Object.keys(down ? migration.models.deleted : migration.models.added)
      .map(name => schema.tables.find(table => table.tableName === name))
      .map(model => {

        const tableSchema = schema.tables.find(t => t.tableName === model.tableName);
        const fields = model.fields.map(field => new Operations.CreateField(tableSchema.fields
          .find(f => f.name === field.name)));
        return new Operations.CreateModel({ name: model.tableName, fields });
      });

    const upModelRename = oldName => new Operations.RenameModel({ oldName, newName: migration.models.altered[oldName] });

    const downModelRename = newName => new Operations.RenameModel({ newName, oldName: migration.models.altered[newName] });

    const renames = Object.keys(migration.models.altered)
      .map(down ? downModelRename : upModelRename);

    const downAlters = table => {

      let tableName = table.tableName;
      if (migration.models.altered[table.tableName]) {
        tableName = migration.models.altered[table.tableName];
      }

      const adds = Object.keys(migration.fields.deleted[tableName] || {})
        .map(name => new Operations.CreateField(table.fields.find(f => f.name === name)));

      const dels = Object.keys(migration.fields.added[tableName] || {})
        .map(name => new Operations.DropField({ name }));

      const alts = Object.keys(migration.fields.altered[tableName] || {})
        .map(newName => new Operations.RenameField({ oldName: migration.fields.altered[tableName][newName], newName }));
      const fields = [...adds, ...dels, ...alts];
      return new Operations.AlterModel({ name: table.tableName, fields });
    };

    const upAlters = table => {
      const adds = Object.keys(migration.fields.added[table.tableName] || {})
        .map(field => new Operations.CreateField(table.fields.find(f => f.name === field)));
      const dels = Object.keys(migration.fields.deleted[table.tableName] || {})
        .map(field => new Operations.DropField({ name: field }));
      const alts = Object.keys(migration.fields.altered[table.tableName] || {})
        .map(oldName => new Operations.RenameField({ oldName, newName: migration.fields.altered[table.tableName][oldName] }));
      const fields = [...adds, ...dels, ...alts];
      return new Operations.AlterModel({ name: table.tableName, fields });
    };

    const alters = schema.tables
      .filter(table => down ? !migration.models.deleted[table.tableName] : !migration.models.added[table.tableName])
      .map(down ? downAlters : upAlters);

    const removes = Object.keys(down ? migration.models.added : migration.models.deleted)
      .map(name => new Operations.DropModel({ name }));

    return [...removes, ...renames, ...modelAdds, ...alters];
  }

  constructor(oldSchema: IDBSchema, newSchema: IDBSchema) {
    this.oldSchema = oldSchema;
    this.newSchema = newSchema;
  }
}

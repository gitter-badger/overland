import { Model as ObjectionModel } from 'objection';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IModelRelation } from '../interfaces';
import Field from './Field';

/**
 * Base class for relation types. Provides basic relation data for Objection.
 */
export default class RelationField extends Field {

  public static relations = {
    belongsToOne: ObjectionModel.BelongsToOneRelation,
    hasMany: ObjectionModel.HasManyRelation,
    hasOne: ObjectionModel.HasOneRelation,
    manyToMany: ObjectionModel.ManyToManyRelation
  };

  public relationModel: IModelConstructor;
  public relation: string;
  public fieldType = 'biginteger';
  public inputTag = 'select';

  public defineRelationItem(model: IModelConstructor): IModelRelation {

    // name of the related table.
    const to = this.relationModel.tableName;
    // name of the pk of the related table.
    const toCol = this.relationModel.primaryKey;

    // including the table name...
    const toName = `${to}.${toCol}`;
    // from column of this field's table - something in the whereabouts of 'RelationFoo,' where Foo is the PK and Relation is the Model.
    const from = model.tableName;
    const targetTableName = to.split('_')[1];
    const fromCol = `${targetTableName[0].toLowerCase() + targetTableName.slice(1)}${toCol[0].toUpperCase()}${toCol.slice(1)}`;
    const fromMTM = `${from}.${model.primaryKey}`;
    // including the table name...
    const fromName = from + '.' + fromCol;
    // only need this if it's many to many. Otherwise leave it undefined.
    const sameApp = from.split('_')[0] === to.split('_')[0];
    const throughTable = sameApp ? `${from}_${targetTableName}` : from + '_' + to;
    const through = this.relation === 'manyToMany' ? {
      from: `${throughTable}.${from.split('_')[1].toLowerCase()}Id`,
      modelClass: this.opts.through,
      to: `${throughTable}.${targetTableName.toLowerCase()}Id`
    } : undefined;

    const join = through ? {
      from: fromMTM,
      to: toName,
      through
    } : {
        from: fromName,
        to: toName
      };

    return {
      modelClass: this.relationModel,
      relation: RelationField.relations[this.relation],
      join
    };
  }
}

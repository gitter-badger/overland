/// <reference path="../../../../../typings/index.d.ts" />
import { IFieldSchema } from '../../../interfaces';
import { FieldOperation } from '../operation';
import * as Knex from 'knex';
import * as debugFn from 'debug';
import * as stringify from 'stringify-object';

const debug = debugFn('overland:migrations');

export default class CreateField extends FieldOperation {

  public args: any[];
  public schema: IFieldSchema;

  public static args(schema: IFieldSchema): any[] {
    const type = schema.type;
    const opts = schema.opts || {};
    const res: any[] = [ schema.name ];
    if (type === 'text') {
      res.push(opts.textType);
    } else if (type === 'string') {
      res.push(opts.length);
    } else if (type === 'float') {
      res.push(opts.scale, opts.precision);
    } else if (type === 'enum' && opts.enumValues) {
      schema.type = 'enu';
      res.push(opts.enumValues);
    } else if (type === 'jsonb') {
      res.push(true);
    }
    return res.filter(a => !!a);
  }

  public execute(table: Knex.TableBuilder): void {
    debug(`\tcreating ${ this.schema.type } column ${ this.schema.name }`);
    const col: Knex.ColumnBuilder = table[this.schema.type](...this.args);
    const opts = this.schema.opts || {};
    if (opts.unsigned) {
      col.unsigned();
    }
    if (opts.unique) {
      col.unique();
    }
    if (opts.primaryKey) {
      col.primary();
    }
    if (opts.defaultTo) {
      col.defaultTo(opts.defaultTo);
    }
    if (this.schema.fk) {
      col
        .references(this.schema.fk.references)
        .inTable(this.schema.fk.inTable)
      if (this.schema.fk.onDelete) {
        col.onDelete(this.schema.fk.onDelete);
      }
      if (this.schema.fk.onUpdate) {
        col.onDelete(this.schema.fk.onUpdate);
      }
    }
    if (opts.nullable === false) {
      col.notNullable();
    }
  }

  public toString(): string {
    return `\t\t\t\tnew CreateField(${ stringify(this.schema )})`;
  }

  constructor(schema: IFieldSchema) {
    super();
    this.schema = schema;
    this.args = CreateField.args(this.schema);
  }
}

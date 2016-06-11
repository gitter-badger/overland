/// <reference path="../../../../../typings/index.d.ts" />
import { TableOperation, FieldOperation } from '../operation';
import * as Knex from 'knex';

interface IAlterModelSchema {
  name: string;
  fields: FieldOperation[];
};

export default class AlterModel extends TableOperation {

  public name: string;
  public fields: FieldOperation[];

  public execute(schema: Knex.SchemaBuilder) {
    return schema.table(this.name, table => {
      this.fields.forEach(field => field.execute(table));
    });
  }

  public toString(): string {
    return `\t\tnew ${ this.constructor.name }({name: '${ this.name }', fields: [\n${ this.fields.join(',\n') }\n]})`;
  }

  constructor(opts: IAlterModelSchema) {
    super();
    this.name = opts.name;
    this.fields = opts.fields;
  }
}
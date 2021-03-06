/// <reference path="../../../../../typings/index.d.ts" />
import CreateField from '../field/CreateField';
import { TableOperation } from '../operation';
import * as Knex from 'knex';

interface ICreateModelOpts {
  name: string;
  fields: CreateField[];
}

export default class CreateModel extends TableOperation {

  public name: string;
  public fields: CreateField[];

  public execute(schema: Knex.SchemaBuilder) {
    return schema.createTable(this.name, table => {
      this.fields.forEach(field => field.execute(table));
    });
  }

  public toString(): string {
    return `\t\tnew ${ this.constructor.name }({ name: '${ this.name }', fields: [\n${ this.fields.join(',\n') }\n\t\t\t]})`;
  }

  constructor(opts: ICreateModelOpts) {
    super();
    this.name = opts.name;
    this.fields = opts.fields;
  }
}

/// <reference path="../../../../../typings/index.d.ts" />
import { TableOperation } from '../operation';
import * as Knex from 'knex';

interface IDeleteModelOpts {
  name: string;
}

export default class DropModel extends TableOperation {
  public table: string;
  public execute(schema: Knex.SchemaBuilder) {
    return schema.dropTableIfExists(this.table);
  }

  public toString(): string {
    return `\t\tnew ${ this.constructor.name }({ name: '${ this.table }' })`;
  }

  constructor(opts: IDeleteModelOpts) {
    super();
    this.table = opts.name;
  }
}

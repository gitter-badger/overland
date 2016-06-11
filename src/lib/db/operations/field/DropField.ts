/// <reference path="../../../../../typings/index.d.ts" />
import { FieldOperation } from '../operation';
import * as Knex from 'knex';

interface IDropFieldOpts {
  name: string;
}

export default class DropField extends FieldOperation {

  public column: string;

  public execute(table: Knex.TableBuilder) {
    return table.dropColumn(this.column);
  }

  public toString(): string {
    return `\t\t\t\tnew DropField({ name: '${ this.column }' })`;
  }

  constructor(opts: IDropFieldOpts) {
    super();
    this.column = opts.name;
  }
}

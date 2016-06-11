/// <reference path="../../../../../typings/index.d.ts" />
import { TableOperation, FieldOperation } from '../operation';
import { IFieldSchema } from '../../../interfaces/IFieldSchema';
import * as Knex from 'knex';

interface IDropFieldOpts {
  name: string;
}

class DropField extends FieldOperation {
  
  public column: string;
  
  public execute(table: Knex.TableBuilder) {
    return table.dropColumn(this.column)
  }
  
  toString() {
    return `\t\t\t\tnew DropField({ name: '${ this.column }' })`;
  }
  
  constructor(opts: IDropFieldOpts) {
    super();
    this.column = opts.name;
  }
}

export { DropField as default };
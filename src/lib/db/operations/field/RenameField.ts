/// <reference path="../../../../../typings/index.d.ts" />
import { TableOperation, FieldOperation } from '../operation';
import * as Knex from 'knex';

interface IRenameFieldOpts {
  oldName: string,
  newName: string
}

class RenameField extends FieldOperation {
  
  public oldName: string;
  public newName: string;
  
  public execute(table: Knex.TableBuilder) {
    table.renameColumn(this.oldName, this.newName)
  }

  toString() {
    return `\t\t\t\tnew RenameField({
      oldName: '${ this.oldName }',
      newName: '${ this.newName }'
    })`;
  }
  
  constructor(opts: IRenameFieldOpts) {
    super();
    this.oldName = opts.oldName;
    this.newName = opts.newName;
  }
  
}

export { RenameField as default };
/// <reference path="../../../../../typings/index.d.ts" />
import { TableOperation, FieldOperation } from '../operation';
import * as Knex from 'knex';

interface IRenameModelOpts {
  oldName: string,
  newName: string
}

class RenameModel extends TableOperation {
  
  public oldName: string;
  public newName: string;
  
  public execute(schema: Knex.SchemaBuilder) {
    return schema.renameTable(this.oldName, this.newName)
  }

  public toString() {
    return `\t\tnew ${ this.constructor.name }({ oldName: '${ this.oldName }', newName: '${ this.newName }'})`;
  }
  
  constructor(opts: IRenameModelOpts) {
    super();
    this.oldName = opts.oldName;
    this.newName = opts.newName;
  }
}

export { RenameModel as default };
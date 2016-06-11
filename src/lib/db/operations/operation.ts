import * as Knex from 'knex';
import { IMigrationOperation } from '../../interfaces';

abstract class FieldOperation implements IMigrationOperation {
  abstract execute(table: Knex.TableBuilder): void;
  public toString() {
    return `${ this.constructor.name }()`;
  }
}

abstract class TableOperation implements IMigrationOperation {
  abstract execute(schema: Knex.SchemaBuilder): void;
  public toString() {
    return `${ this.constructor.name }()`;
  }
}

export { FieldOperation, TableOperation };
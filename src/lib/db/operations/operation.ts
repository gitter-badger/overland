import * as Knex from 'knex';
import { IMigrationOperation } from '../../interfaces';

abstract class FieldOperation implements IMigrationOperation {
  public abstract execute(table: Knex.TableBuilder): void;
  public toString() {
    return `${ this.constructor.name }()`;
  }
}

abstract class TableOperation implements IMigrationOperation {
  public abstract execute(schema: Knex.SchemaBuilder): void;
  public toString() {
    return `${ this.constructor.name }()`;
  }
}

export { FieldOperation, TableOperation };
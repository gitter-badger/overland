import { ITypedHash } from './ITypedHash';

export interface IMigrationSchema {
  models: {
    added: ITypedHash<boolean>;
    altered: ITypedHash<string>;
    deleted: ITypedHash<boolean>;
  };
  fields: {
    added: ITypedHash<ITypedHash<boolean>>;
    altered: ITypedHash<ITypedHash<string>>;
    deleted: ITypedHash<ITypedHash<boolean>>;
  };
}

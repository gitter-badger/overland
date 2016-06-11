import { IModelSchema } from './IModelSchema';

export interface IDBSchema {
  name?: string;
  version?: string;
  tables: IModelSchema[];
}

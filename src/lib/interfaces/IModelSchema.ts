import { IFieldSchema } from './IFieldSchema';

export interface IModelSchema {
  tableName: string;
  name: string;
  app: string;
  oldTableName?: string;
  renamed?: boolean;
  deleted?: boolean;
  added?: boolean;
  fields?: IFieldSchema[];
}

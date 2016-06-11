import Model from '../core/model';
import Field from '../db/Field';

interface IModelStaticProp {
  name: string;
  field: Field;
}

export interface IModelRelation {
  modelClass: IModelConstructor;
  relation: Function;
  join: {
    from: string;
    through?: {
      modelClass: IModelConstructor;
      from: string;
      to: string;
    },
    to: string;
  };
}

export interface IModelConstructor {
  app?: string;
  tableName: string;
  primaryKey: string;
  fields: { name: string, field: Field }[];
  relationMappings: { [key: string]: IModelRelation };
  staticProps: any;
  titleField: string;
  knex(knex?: any): any | void;
  query(): any;
  toJSON(): any;
  new (...args: any[]): Model;
}

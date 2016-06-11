export interface IFieldSchema {
  name: string;
  type: string;
  added?: boolean;
  deleted?: boolean;
  renamed?: boolean;
  oldFieldName?: string;
  fk?: {
    references: string;
    inTable: string;
    through?: {
      from: string;
      to: string;
    };
    onUpdate?: any;
    onDelete?: any;
  };
  opts?: {
    unsigned?: boolean;
    unique?: boolean;
    primaryKey?: boolean;
    nullable?: boolean;
    scale?: number;
    precision?: number;
    textType?: string;
    length?: number;
    enumValues?: any[];
    defaultTo?: any
  };
}

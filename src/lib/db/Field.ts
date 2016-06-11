/// <reference path="../../../typings/index.d.ts" />
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IFieldSchema } from '../interfaces/IFieldSchema';

/**
 * Base class for a database column type.
 */
abstract class Field {

  public isTitleField: boolean;
  public fieldType: string;
  public opts: any;
  public label: string;

  public toJSON(model: IModelConstructor): IFieldSchema {
    const out: IFieldSchema = { name: null, type: this.fieldType };
    if (this.opts) {
      out.opts = this.opts;
    }
    return out;
  }

  constructor(label?: string | any, opts?: string | any) {
    if (typeof label === 'string') {
      this.label = label;
      this.opts = opts || {};
    } else {
      this.opts = label;
    }
  }
}

export { Field as default };

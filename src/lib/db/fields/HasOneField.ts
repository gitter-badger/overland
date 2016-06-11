import RelationField from '../RelationField';
import { IModelConstructor } from '../../interfaces/IModelConstructor';

export default class HasOneField extends RelationField {
  public relation = 'hasOne';
  constructor(label: string | IModelConstructor, Model?: IModelConstructor | any, opts?: any) {
    super(label);
    if (typeof label === 'string') {
      this.relationModel = Model;
      this.opts = opts || {};
    } else {
      this.opts = Model || {};
      this.relationModel = label;
    }
    this.opts.unsigned = true;

    if (!this.relation) {
      throw new Error(`No such model for field ${ this.constructor.name }`);
    }
  }
}

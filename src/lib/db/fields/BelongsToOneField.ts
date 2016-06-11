import RelationField from '../RelationField';
import { IModelConstructor } from '../../interfaces/IModelConstructor';

export default class BelongsToOneField extends RelationField {
  public relation = 'belongsToOne';
  constructor(label: string | IModelConstructor, Model?: IModelConstructor | any, opts?: any) {
    super(label);
    if (typeof label === 'string') {
      this.relationModel = Model;
      this.opts = opts || {};
    } else {
      this.relationModel = label;
      this.opts = Model || {};
    }
    this.opts.unsigned = true;

    if (!this.relation) {
      throw new Error(`No such model for field ${ this.constructor.name }`);
    }
  }
}

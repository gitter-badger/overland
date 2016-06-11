import RelationField from '../RelationField';
import { IModelConstructor } from '../../interfaces/IModelConstructor';

export default class ManyToManyField extends RelationField {
  public relation = 'manyToMany';

  public toJSON(model: IModelConstructor) {
    return {
      fk: {
        inTable: this.relationModel.tableName,
        references: this.relationModel.primaryKey,
        through: this.defineRelationItem(model).join.through
      },
      foreignKey: true,
      name: this.opts.name,
      opts: this.opts,
      type: this.fieldType
    };
  }
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
      throw new Error(`No such model for field ${this.constructor.name}`);
    }
  }
}

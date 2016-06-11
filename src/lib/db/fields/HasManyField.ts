import RelationField from '../RelationField';
import { IModelConstructor } from '../../interfaces/IModelConstructor';

export default class HasManyField extends RelationField {

  public relation = 'hasMany';

  public toJSON(model: IModelConstructor) {
    return {
      fk: {
        inTable: this.relationModel.tableName,
        references: this.relationModel.primaryKey
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
      this.opts = opts || {}
    } else {
      this.relationModel = label;
      this.opts = Model || {};
    }

    this.opts.unsigned = true;

    if (!this.relationModel) {
      throw new Error(`No such model for field ${ this.constructor.name }`);
    }

    const to = this.relationModel.tableName;
    const toCol = this.relationModel.primaryKey;
    this.opts.name = `${ to }${ toCol[0].toUpperCase() }${ toCol.slice(1) }`;
  }
}
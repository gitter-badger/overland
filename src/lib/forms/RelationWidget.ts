import Widget from './Widget';
import RelationField from '../db/RelationField';
import { uncamelcase } from '../../lib/helpers';

class RelationWidget extends Widget {
  public field: RelationField;

  public async toHTML(label: string, attributes: any = {}): Promise<string> {
    const classes = attributes.classes || [];
    const results = await this.field.relationModel.query();
    const rawData = this.value;
    const data = Array.isArray(rawData) ? rawData : [rawData];
    const options = results.map(r => ({
      id: r[this.field.relationModel.primaryKey],
      name: r[this.field.relationModel.titleField]
    }));

    const mul = this.field.relation === 'manyToMany' || this.field.relation === 'hasMany';
    const attrs = o => `${ data.findIndex(d => d.id === o.id) >= 0 ? 'selected' : '' } value="${ o.id }"`;
    const opts = options.map(o => `<option ${ attrs(o) }>${ o.name }</option>`);
    return `<label>${ uncamelcase(label) }</label><select ${mul ? 'multiple' : ''} class="${classes.join(' ')}">${opts}</select>`;
  }
}

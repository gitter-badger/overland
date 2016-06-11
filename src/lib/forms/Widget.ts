import { uncamelcase } from '../../helpers';
import Field from '../db/Field';

export default class Widget {
  public value: any;
  public opts: any;
  public field: Field;

  public bind(value: any) {
    this.value = value;
  }

  public async toHTML(label: string, attributes: any = {}): Promise<string> {
    const attrs = [{ name: 'type', value: 'text' }];
    const classes = attributes.classes || [];
    const opts = this.opts || {};
    const value = this.value;

    const render = {
      attributes: attrs.map(a => `${a.name}="${a.value}"`).join(' '),
      classes: classes.length ? `class="${classes.join(' ')}"` : '',
      required: opts.nullable === false ? 'required' : ''
    };

    const labelHTML = `<label>${ uncamelcase(label) }</label>`;
    const valueHTML = `${ value ? `value="${value}"` : '' }`;
    const inputHTML = `<input ${ render.classes } ${ render.attributes } ${ render.required } ${ valueHTML } />`;
    return `${ labelHTML }${ inputHTML }`;
  }
}

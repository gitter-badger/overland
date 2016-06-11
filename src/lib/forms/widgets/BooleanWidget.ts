import Widget from '../Widget';
import uncamelcase from '../../helpers/uncamelcase';
import BooleanField from '../../db/fields/BooleanField';

export default class BooleanWidget extends Widget {
  public field: BooleanField;
  public value: boolean;

  public bind(value) {
    this.value = value === 0 ? false : true;
  }

  public async toHTML(label: string, attributes: any = {}): Promise<string> {

    const classes = attributes.classes || [];
    const opts = this.opts || {};
    const value = this.value;
    const render = {
      classes: classes.length ? `class="${ classes.join(' ') }"` : '',
      required: opts.nullable === false ? 'required' : ''
    };

    const htmlLabel = `<label>${ uncamelcase(label) }</label>`;
    const htmlInput = `<input type="checkbox" ${ value ? 'checked' : '' } ${ render.classes } ${ render.required }></input>`;
    return `${ htmlLabel }${ htmlInput }`;
  }

  constructor(field, opts) {
    super();
    this.field = field;
    this.opts = opts;
  }
}

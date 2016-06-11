import Widget from '../Widget';
import { uncamelcase } from '../../helpers';

class JSONWidget extends Widget {

  public inputTag = 'textarea';

  public async toHTML(label: string, attributes: any = {}): Promise<string> {
    const classes = attributes.classes || [];
    const opts = this.opts || {};
    const value = this.value;
    const render = {
      classes: classes.length ? `class="${classes.join(' ')}"` : '',
      required: opts.nullable === false ? 'required' : ''
    };
    return `<label>${uncamelcase(label)}</label><textarea ${render.classes} ${render.required}>${value ? value : ''}</textarea>`;
  }
}
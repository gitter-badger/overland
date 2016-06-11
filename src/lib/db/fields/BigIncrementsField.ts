import Field from '../Field';

export default class BigIncrementsField extends Field {
  public fieldType = 'bigincrements';
  public inputType = 'number';
  constructor(opts?: any) {
    super();
    this.opts = opts || {};
    this.opts.primaryKey = true;
  }
}

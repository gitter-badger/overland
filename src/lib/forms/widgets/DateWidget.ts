import Widget from '../Widget';

export default class DateWidget extends Widget {
  public inputType = 'date';
  public bind(value) {
    this.value = value ? new Date(value.toString()) : value;
  }
}

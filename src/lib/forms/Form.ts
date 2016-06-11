import Widget from './Widget';

interface IWidgets {
  name: string;
  widget: Widget;
}

export default class Form {

  public widgets: Map<string, Widget>;

  get data() {
    const data = {};
    this.widgets.forEach((field, name) => {
      data[name] = field.value;
    });
    return data;
  }

  public bind(data) {
    Object.keys(data)
      .filter(key => this.widgets.has(key))
      .forEach(key => {
        const widget = this.widgets.get(key);
        widget.bind(data[key]);
        this.widgets.set(key, widget);
      });
  }

  public async render() {
    const widgets = Array.from(this.widgets).map(([name, f]) => f.toHTML(name));
    const rendered = await Promise.all(widgets);
    return rendered.join('\n');
  }

  constructor(widgets: IWidgets[], data?: any) {
    this.widgets = new Map<string, Widget>();
    widgets.forEach(({ name, widget }) => this.widgets.set(name, widget));
    if (data) {
      this.bind(data);
    }
  }
}

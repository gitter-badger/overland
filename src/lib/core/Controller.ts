import * as camelcase from 'camelcase';

// Provides a base class for controllers. Includes auto-naming functionality.  
export default class Controller {

  // Name of the controller's application.
  public static app: string;

  // Internal name of the controller.
  private static _controller: string = null;

  // Sets the private controller variable.
  static set controller(name: string) {
    this._controller = name;
  }

  // Returns the name of the controller if set, otherwise a modified constructor name.
  static get controller(): string {
    return this._controller || camelcase(this.name.replace(/(Ctrl|Controller)/i, ''));
  }

  // Instance variables set by the dispatch middleware.
  public name: string;
  public action: string;
  public app: string;
}

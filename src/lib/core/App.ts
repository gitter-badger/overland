/// <reference path="../../../typings/index.d.ts" />
import * as camelcase from 'camelcase';
import Router from './router';
import Overland from './overland';
import { IControllerConstructor } from '../interfaces/IControllerConstructor';
import { IModelConstructor } from '../interfaces/IModelConstructor';

// The App class serves as Overland's entry point into a sub-application.

export default class App {

  // Most important for this file is the app name. This is stored in a private `_app` variable
  // so we can apply it to various objects that are provided to the app configuration. This
  // allows us to transparently add information about the app to its components that might not
  // otherwise hold any reference to this subapplication.

  /**
   * Returns the machine-readable app name.
   */
  static get app() {
    return this._app || camelcase(this.name.replace('App', ''));
  }

  /**
   * Sets router `app` property to the machine-readable app name.
   */
  static set app(name: string) {
    this._app = name;
    if (this._router) {
      this._router.app = name;
    }
    if (this._models) {
      this._models = this._models.map(model => {
        model.app = name;
        return model;
      });
    }
    if (this._controllers) {
      this._controllers = this._controllers.map(ctrl => {
        ctrl.app = name;
        return ctrl;
      });
    }
  }

  // An example of this pattern is visible with the `routes` property. We want to be able to
  // determine the app the router is coming from when we `use()` it in another router (so it
  // can prepend the app name to the route targets).

  /**
   * Returns the router.
   */
  static get routes() {
    return this._router;
  }

  /**
   * Sets router `app` property to the machine-readable app name.
   */
  static set routes(r: Router) {
    r.app = this.app;
    this._router = r;
  }

  // Same with controllers. This saves us the pain of doing this on every request, instead
  // doing it on app creation.

  /**
   * Sets controllers' `app` property to the machine-readable app name.
   */
  static set controllers(ctrls: IControllerConstructor[]) {
    this._controllers = ctrls.map(ctrl => {
      ctrl.app = this.app;
      return ctrl;
    });
  }

  /**
   * Returns the `_controllers` hash.
   */
  static get controllers(): IControllerConstructor[] {
    return this._controllers;
  }

  static set models(models: IModelConstructor[]) {
    this._models = models.map(model => {
      model.app = this.app;
      return model;
    });
  }

  static get models(): IModelConstructor[] {
    return this._models;
  }

  /**
   * Human readable application name. Used for administration.
   */
  public static label: string;
  public static meta: any;

  // The App should also provide information about the directory that views are in - it makes
  // the most sense to keep them with a site's component applications. Overland's render
  // middleware will look here first for a view, then in `${ siteRoot }/views/${ app }`.

  /**
   * View directory for the application.
   */
  public static views: string = `${ __dirname }/views`;

  /**
   * Machine-readable application name; required.
   */
  private static _app: string;

  /**
   * Routes for the application.
   */
  private static _router: Router;

  /**
   * Controllers for the application.
   */
  private static _controllers: IControllerConstructor[];

  /**
   * Models for the application.
   */
  private static _models: IModelConstructor[];

  public app: string;
  public label: string;
  public views: string;
  public meta: any;
  public controllers: IControllerConstructor[];
  public models: IModelConstructor[];

  // Apps can optionally be made with an asychronous instance method called `init()` that takes
  // the Overland instance as a parameter and can be used to perform various operations on
  // startup.

  /**
   * An async initialize function to be overridden.
   */
  public async init(app: Overland): Promise<any> {
    return;
  };
}

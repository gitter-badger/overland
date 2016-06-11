/** External imports */
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as Knex from 'knex';
import * as bodyParser from 'koa-bodyparser';
import * as mincer from 'koa-mincer';

/** Core imports */
import Router from './router';
import App from './app';
import * as Helpers from '../helpers';

/** Middleware imports */
import dispatch from '../middleware/dispatch';
import override from '../middleware/override';

/** Interface imports */
import {
  IOverlandSettings,
  IAppConstructor,
  IModelConstructor,
  IControllerConstructor,
  IMiddleware,
  IOverlandContext
} from '../interfaces';

export default class Overland extends Koa {

  /**
   * Settings object.
   */
  public settings: IOverlandSettings;
  public router = new KoaRouter();
  public apps: Map<string, App> = new Map<string, App>();
  public controllers = new Map<string, IControllerConstructor>();
  public models = new Map<string, IModelConstructor>();
  public keys: string[];
  public helpers: any;
  public assets: string[] = [];
  public knex: Knex;

  public createContext(req, res): IOverlandContext {
    const ctx = <IOverlandContext>Object.assign({}, super.createContext(req, res), {
      router: Object.assign({}, this.router, { helpers: this.helpers }),
      urlFor: Helpers.redirectTo.bind(this)
    });
    return ctx;
  }

  public createRenderContext(app: string, data: any): any {
    const thisHelpers = this.helpers[app];
    const helpers = Object.assign({}, this.helpers, thisHelpers);
    return Object.assign({}, data, helpers);
  }


  public async initApp(App: IAppConstructor) {

    const app = new App();

    app.app = App.app;
    app.label = App.label;
    app.views = App.views;
    app.meta = App.meta;
    app.controllers = App.controllers || [];
    app.models = App.models || [];

    await app.init(this);

    this.apps.set(App.app, app);

    if (App.assets) {
      this.assets.push(App.assets);
    }

    app.models.forEach(model => {
      model.knex(this.knex);
      this.models.set(`${ model.tableName }`, model);
    });

    app.controllers.forEach(controller => {
      this.controllers.set(`${ App.app }.${ controller.controller }`, controller);
    });

    return;
  }

  /**
   * Loads middleware, routes, etc.
   */
  public async init() {
    this.keys = this.settings.keys;
    this.knex = Knex(this.settings.databases[process.env.NODE_ENV || 'development']);
    await Promise.all(this.settings.apps.map(app => this.initApp(app)));
    if (this.settings.assets) {
      this.assets.push(this.settings.assets);
    }
    this.use(bodyParser());
    this.use(override(this));
    this.use(this.settings.engine(this));
    this.use(mincer({
      mountPoint: '/assets',
      paths: this.assets,
      production: process.env.NODE_ENV === 'production',
      root: this.settings.assets,
    }));
    this.settings.middleware.forEach(middleware => this.use(middleware));
    this.use(this._drawRoutes(this.settings.routes));
    return this;
  }

  /**
   * Returns the App's model constructors, optionally filtered by app.
   */
  public modelConstructors(app?: string): IModelConstructor[] {
     return [...this.models].filter(m => app ? m[0].includes(app) : true).map(m => m[1]);
  }

  /**
   * Draws routes from the setting's router instance.
   */
  private _drawRoutes(router: Router): IMiddleware {
    this.helpers = router.helpers;

    router.routes.forEach(r => {

      const appController = r.controller.split('/').pop();
      const action = r.action;
      if (action === ':action') {
        throw new Error(r);
      }
      const [ mountedApp, controller ] = appController.split('.');
      const appName = mountedApp.split('/').pop();
      const hasApp = this.apps.has(appName);
      if (hasApp) {
        const app = this.apps.get(appName);
        const ctrl = app.controllers ? app.controllers.find(ctrl => ctrl.controller === controller) : false;
        if (ctrl) {
          r.verb.forEach(method => {
            const name = `${ appController }#${ action }`;
            const fn = dispatch(this, appController, action, r.options);
            this.router[method](name, r.path, fn);
          });
        } else {
          const found = app.controllers.map(ctrl => ctrl.controller).join(', ');
          const err = `App '${ appName }' has no such controller '${ controller }': found [${ found  }]`;
          throw new Error(err);
        }
      } else {
        throw new Error(`No such app '${ appName }'!`);
      }
    });
    return this.router.routes();
  }

  constructor(settings: IOverlandSettings) {
    super();
    this.settings = settings;
  }
}

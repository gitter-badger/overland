/// <reference path="../../../typings/index.d.ts" />
import RouteMapper from 'route-mapper';

// A minor extension of Route-Mapper's router to provide mounting functionality. Also has a 
// `app` property that is set by the App class when its static `routes` property is assigned.
// ```typescript
// import { Router } from 'overland/core';
// import MyApp from 'myapp';
//
// const router = new Router();
// router.use('foo', MyApp.routes);
// // GET /foo/bar => 'myapp.foo#bar'
//
// export { router as default };
// ```
class Router extends RouteMapper {

  /**
   * Set by the App class when this is attached to its routes prop.
   */
  public app: string;
  public routes: any[];

  /**
   * Mounts router and prefixes the target of `options.to` with the router's name.
   */
  public use(path: string, router: Router): Router {
    this.namespace(path, () => {
      router.routes.forEach(route => {
        route.options.to = `${ router.app }.${ route.options.to || route.controller }`;
        route.options.action = route.action;
        this.match(route.path, route.options);
      });
    });

    const helpers = {};
    Object.keys(this.helpers)
      .filter(key => new RegExp(path, 'i').test(key))
      .forEach(key => {
        const name = key.replace(new RegExp(path, 'i'), '');
        const normalized = name ? name[0].toLowerCase() + name.slice(1) : key;
        helpers[normalized] = this.helpers[key];
      });

    this.helpers[router.app] = helpers;
    return this;
  }
}

export { Router as default };

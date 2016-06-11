import * as koa from 'koa';
import * as Router from 'koa-router';

export interface IOverlandContext extends koa.KoaContext {
  helpers?: { [key: string]: Function };
  router: Router;
  redirectTo?(any): any;
  urlFor?(any): any;
}

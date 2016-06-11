/**
 * Describes a Koa middleware.
 */
export interface IMiddleware {
  (ctx: any, next?: Function): Promise<any>;
}

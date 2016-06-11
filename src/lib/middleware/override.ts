import Overland from '../core/overland';

export default function override(app?: Overland) {
  return async function(ctx, next?) {
    if (ctx.request && ctx.request.body) {
      const method = ctx.request.body._method;
      ctx.method = method ? method : ctx.method;
    }
    return await next();
  };
}

import Overland, { Controller } from '../../core';
import { IMiddleware } from '../interfaces/IMiddleware';

/**
 * Dispatches a request to `app.controller#action.`
 */
export default function dispatch(overland: Overland, controller: string, action: string, options: any): IMiddleware {
  return async function dispatch(ctx: any, next?: Function) {
    const Ctrl = overland.controllers.get(controller);
    const ctrl = <Controller>new Ctrl();
    let fn;
    if (ctrl[action]) {
      fn = ctrl[action].bind(ctrl);
    } else {
      throw new Error(`${ controller }#${ action } is not a function.`);
    }

    ctrl.app = Ctrl.app;
    ctrl.name = controller.split('.').pop();
    ctrl.action = action;

    ctx.overland = overland;
    ctx.controller = ctrl;
    ctx.router.options = options;
    await Promise.resolve(fn(ctx, next));
  };
}

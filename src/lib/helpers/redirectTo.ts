import { Model } from '../../core';
import * as camelcase from 'camelcase';
import { IControllerConstructor } from '../interfaces';

export default function redirectTo(...opts: (any | Model)[]) {
  if (opts[0].constructor.$$knex) {

    const model = opts[0];
    const name = camelcase(model.constructor.name);

    const ctrlName = <IControllerConstructor>[ ...this.controllers ]
      .map(([ key ]) => key)
      .find(fullname => {
        const [ , ctrl ] = fullname.split('.');
        return camelcase(ctrl).search(new RegExp(name, 'i')) > -1;
      });

    const Ctrl = this.controllers.get(ctrlName);
    const app = Ctrl.app;
    const optAction = opts.find(item => item.action ? item : false);
    const controller = `${ app }.${ Ctrl.controller }`;
    const action = optAction ? optAction.action : 'show';
    const route = `${ controller }#${ action }`;
    const layer = this.router.route(route);

    if (!layer) {
      throw new Error('No route found.');
    } else {
      const popts = {};
      layer.paramNames.forEach(p => {
        popts[p.name] = model[p.name];
      });
      return redirectTo.call(this, { controller, action, opts: popts });
    }
  } else if (opts[0]) {
    const popts = opts[0];
    if (popts.controller && popts.action && popts.opts) {
      return this.router.url(`${ popts.controller }#${ popts.action}`, popts.opts);
    } else {
      try {
        return this.router.url(popts);
      } catch (e) {
        throw new Error('Invalid input for redirectTo');
      }
    }
  }
}

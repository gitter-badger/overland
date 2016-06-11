import App from '../core/app';
import Router from '../core/router';
import { IModelConstructor } from './IModelConstructor';
import { IControllerConstructor } from './IControllerConstructor';

export interface IAppConstructor {
  app: string;
  label: string;
  controllers: IControllerConstructor[];
  models: IModelConstructor[];
  routes: Router;
  views: string;
  meta?: any;
  assets?: string;
  new (...args: any[]): App;
}

import Overland from '../../core';
import { IAppConstructor, IMiddleware } from './index';

export interface IOverlandSettings {
  apps: IAppConstructor[];
  middleware: IMiddleware[];
  routes: any;
  databases: { [key: string]: any };
  keys: string[];
  assets: string;
  engine: (opts: Overland) => (ctx: any, next?: any) => Promise<any>;
  views?: string;
}

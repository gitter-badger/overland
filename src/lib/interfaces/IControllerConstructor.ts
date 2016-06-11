import Controller from '../core/controller';

export interface IControllerConstructor {
  app?: string;
  controller: string;
  new(): Controller;
}

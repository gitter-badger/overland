import Overland, { App, Controller } from '../../core';
import { IControllerConstructor } from '../../lib/interfaces/IControllerConstructor';
import { IModelConstructor } from '../../lib/interfaces/IModelConstructor';
import PostCtrl from './ctrl';
import { appRouter as router } from './router';
import { One, Two, Three, Four, Post } from './models';
import { resolve } from 'path';

class MyBlogApp extends App {
  
  public static label = 'My Application';  
  public static controllers = [ PostCtrl ];
  public static models = [ One, Two, Three, Four, Post ];
  public static routes = router;
  public static assets = resolve(__dirname, '../../src/test/fixtures/assets');
  public static views = resolve(__dirname, '../../src/test/fixtures/views');
  
  public init(app: Overland): Promise<any> {
    this['myProp'] = true;
    return this['myProp'];
  }
}

export { MyBlogApp as default };
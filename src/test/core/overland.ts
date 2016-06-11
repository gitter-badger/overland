import { app, badApp } from '../fixtures/overland';
import MyApp from '../fixtures/app';
import Overland, { Router } from '../../core';
import { resolve } from 'path';
import engine from 'overland-nunjucks';
import * as test from 'ava';

test(`should provide access to the app's model constructors`, async function(t) {
  await app.init();
  t.ok(app.modelConstructors()); 
});

test(`should provide access to the app's model constructors, filtered by app`, async function(t) {
  await app.init();
  t.ok(app.modelConstructors('myBlog')); 
});

test('should initialize for a properly configured application', async function(t) {
  t.notThrows(async function() {
    return await app.init();
  });
});

test('should throw if an app is missing', async function(t) {
  t.throws(new Promise((resolve, reject) => {
    badApp.init()
      .then(resolve)
      .catch(reject);
  }), `No such app 'myBlog'!`);
});

test('should throw if an app is missing a controller specified in the router', async function(t) {
  const router = new Router();
  const siteRouter = new Router();
  const App2 = Object.create(MyApp);
  
  router.get('fooblywoobly/:id', { to : 'foobly#show' });
  App2.routes = router;
  siteRouter.use('myApp', router);
  
  const settings = {
    apps: [ MyApp ],
    middleware: [],
    keys: [],
    routes: siteRouter,
    engine,
    assets: resolve(__dirname, '../../src/test/fixtures/assets'),
    views: resolve(__dirname, '../../src/test/fixtures/assets'),
    databases: { development: {} }
  };
  
  const overland = new Overland(settings);
  t.throws(overland.init());
});
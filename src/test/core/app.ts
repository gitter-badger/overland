import * as test from 'ava';
import MyApp from '../fixtures/app';
import { App } from '../../core';
import { Router } from '../../core';
import { app as overland } from '../fixtures/overland';

test(`should have a readable/writeable 'app' property`, t => {
  const MyApp2 = Object.create(MyApp);
  MyApp2.app = 'Foobar';
  t.not(MyApp2.app, MyApp.app);
});

test(`'app' property should default to name of the constructor`, t => {
  t.is(MyApp.app, 'myBlog');
})

test(`should have a readable/writeable 'routes' property`, t => {
  const MyApp2 = Object.create(MyApp);
  MyApp2.routes = new Router();
  t.not(MyApp.routes, MyApp2.routes);
});

test(`should have a readable/writeable 'controllers' property`, t => {
  const MyApp2 = Object.create(MyApp);
  MyApp2.controllers = [];
  t.not(MyApp.controllers, MyApp2.controllers);
});

test(`should have a readable/writeable 'model' property`, t => {
  const MyApp2 = Object.create(MyApp);
  MyApp2.models = [];
  t.not(MyApp.models, MyApp2.models);
});

test(`should have an async init property`, async function(t) {
  const app = new App();
  t.notThrows(() => app.init(overland));
})
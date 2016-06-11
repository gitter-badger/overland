import dispatch from '../../lib/middleware/dispatch';
import * as test from 'ava';
import { app } from '../fixtures/overland';
import MyCtrl from '../fixtures/ctrl';
import * as Router from 'koa-router';

test('should invoke action', async function(t) {
  app.controllers.set('myApp.myCtrl', MyCtrl);
  const res = dispatch(app, 'myApp.myCtrl', 'index', {});  
  const ctx = { body: '', router: new Router() };
  await res(ctx);
  t.same(ctx.body, 'Hello, world.');
});

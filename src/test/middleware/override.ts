 import override from '../../lib/middleware/override';
import * as test from 'ava';
import { app } from '../fixtures/overland';
import MyCtrl from '../fixtures/ctrl';
import { request } from 'http';

test('should override provided method', async function(t) {
  
  await app.init();
  
  const ctx = {
    method: 'post',
    request: {
      body: { _method: 'patch' }
    }
  };
  
  let method;
  
  await override()(ctx, async function() {
    return async function(ctx) {
      method = ctx.method;
    }(ctx);
  });
  
  t.same(method, 'patch');
});

test('should ignore requests without request bodies', async function(t) {
  
  await app.init();
  
  const ctx = {
    method: 'post'
  };
  
  let method;
  
  await override()(ctx, async function() {
    return async function(ctx) {
      method = ctx.method;
    }(ctx);
  });
  
  t.same(method, 'post');
});

test('should ignore requests without a _method', async function(t) {
  
  await app.init();
  const ctx = {
    method: 'post',
    request: { body: {} }
  };
  
  let method;
  
  await override()(ctx, async function() {
    return async function(ctx) {
      method = ctx.method;
    }(ctx);
  });
  
  t.same(method, 'post');
});


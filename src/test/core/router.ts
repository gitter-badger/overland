import { Router } from '../../core';
import * as test from 'ava';

test('should mount router and prefix app name to `route.options.to`', t => {
  const r1 = new Router();
  const r2 = new Router();

  r1.get('foo', { to: 'foo#bar' });
  r1.app = 'blog';
  r2.use('path', r1);
  
  t.same(r2.routes[0].options.to, 'blog.foo#bar');  
});
import { Router } from '../../core';
import * as test from 'ava';

test(`should generate url helpers`, async function(t) {
  
  const r1 = new Router();
  r1.app = 'myApp';
  r1.resources('posts', { controller: 'post' }); 
  
  const r2 = new Router();
  r2.use('myApp', r1);
  
  t.ok(Object.keys(r2.helpers), [ 'myAppPosts', 'myAppNewPost', 'myAppEditPost', 'myAppPost' ]);
});
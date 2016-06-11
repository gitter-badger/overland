import { app } from '../fixtures/overland';
import MyApp from '../fixtures/app';
import Overland, { Router } from '../../core';
import { redirectTo } from '../../lib/helpers';
import * as test from 'ava';

test(`should generate a url from a model instance`, async function(t) {
  const res = await app.init()
  const r = redirectTo.bind(res);
  const Ctor = res.modelConstructors()[4];
  const instance = new Ctor({ id: 2 });
  const out = r(instance);
  t.same(out, '/app/posts/2');
});
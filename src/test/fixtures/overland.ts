import { siteRouter } from './router';
import MyApp from './app';
import MyCtrl from './ctrl';
import Overland from '../../core';
import engine from 'overland-nunjucks';
import { resolve } from 'path';

const app = new Overland({
  apps: [ MyApp ],
  middleware: [],
  keys: [],
  routes: siteRouter,
  engine,
  assets: resolve(__dirname, '../../src/test/fixtures/assets'),
  views: resolve(__dirname, '../../src/test/fixtures/assets'),
  databases: { development: {} }
});

const badApp = new Overland({
  apps: [],
  middleware: [],
  keys: [],
  routes: siteRouter,
  engine,
  assets: resolve(__dirname, '../../src/test/fixtures/assets'),
  views: resolve(__dirname, '../../src/test/fixtures/assets'),
  databases: { development: {} }
});

export { app, badApp };
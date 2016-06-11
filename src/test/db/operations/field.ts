/// <reference path="../../../../typings/index.d.ts" />
import Migration from '../../../lib/db/migration';
import * as Operations from '../../../lib/db/operations';
import * as test from 'ava';
import * as Knex from 'knex';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';

import * as add from '../fixtures/field/add';
import * as rename from '../fixtures/field/rename';

Migration.silent = true;

test.before(t => {
  sinon.stub(inquirer, 'prompt', (q, cb) => {
    const obj = {};
    q.forEach(q => obj[q.name] = true);
    cb(obj);
  });
});

test.beforeEach(t => {
  t.context.db = Knex({
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    }
  });
});

test.afterEach(async function(t) {
  await t.context.db.destroy();
});

test(`should add a field`, async function(t) {
  const m1 = new Migration({ tables: [] }, add.one);
  const m2 = new Migration(add.one, add.two);
  await Migration.run(t.context.db, await m1.up(), await m2.up());
  t.true(await t.context.db.schema.hasColumn('test_table', 'myString'));
});

test(`should rename a field`, async function(t) {
  const m1 = new Migration({ tables: [] }, rename.one);
  const m2 = new Migration(rename.one, rename.two);
  await Migration.run(t.context.db, await m1.up(), await m2.up());
  t.true(await t.context.db.schema.hasColumn('test_table', 'myBigText'));
});
import Migration from '../../../lib/db/migration';
import * as test from 'ava';
import * as Knex from 'knex';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';
import * as add from '../fixtures/model/add';
import * as rename from '../fixtures/model/rename';

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

test.serial(`should add table`, async function(t) {
  const r = new Migration(add.one, add.two);
  await Migration.run(t.context.db, await r.up());
  t.true(await t.context.db.schema.hasTable('test_table'));  
});

test.serial(`should drop table`, async function(t) {
  const m = new Migration(add.one, add.two);
  await Migration.run(t.context.db, await m.up(), await m.down());
  t.false(await t.context.db.schema.hasTable('test_table'));  
});

test.serial(`should rename table`, async function(t) {
  const m1 = new Migration(add.one, rename.one);
  const m2 = new Migration(rename.one, rename.two);
  await Migration.run(t.context.db, await m1.up(), await m2.up());
  t.true(await t.context.db.schema.hasTable('test_table2'));  
});
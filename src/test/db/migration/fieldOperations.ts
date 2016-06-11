import * as test from 'ava';
import Migration from '../../../lib/db/migration';
import * as Operations from '../../../lib/db/operations';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';

import * as add from '../fixtures/field/add';
import * as drop from '../fixtures/field/drop';
import * as rename from '../fixtures/field/rename';

Migration.silent = true;

test.before(t => {
  sinon.stub(inquirer, 'prompt', (q, cb) => {
    const obj = {};
    q.forEach(q => obj[q.name] = true);
    cb(obj);
  });
});

test(`should generate the proper migration path for a field drop`, async function(t) {
  const r = new Migration(drop.one, drop.two);
  t.same(await r.up(), [
    new Operations.AlterModel({ name: 'test_table', fields: [
      new Operations.DropField({ name: 'myText' })
    ]})
  ]);
});

test(`should generate the proper migration path for a field create`, async function(t) {
  const r = new Migration(add.one, add.two);  
  t.same(await r.up(), [
    new Operations.AlterModel({ name: 'test_table', fields: [
      new Operations.CreateField({ name: 'myString', type: 'string', opts: { length: 255, unique: true } }),
      new Operations.CreateField({ name: 'myText', type: 'text' }),
      new Operations.CreateField({ name: "myFloat", type: "float", opts: { precision: 1, scale: 5, nullable: false, defaultTo: 5.0 }}),
      new Operations.CreateField({ name: 'myJSON', type: 'jsonb' }),
      new Operations.CreateField({ name: "myEnum", type: "enum", opts: { enumValues: [ 'foo', 'bar', 'baz' ] }})
    ]})
  ]);
});

test(`should generate the proper migration path for a field rename`, async function(t) {
  const r = new Migration(rename.one, rename.two);
  t.same(await r.up(), [
    new Operations.AlterModel({ name: 'test_table', fields: [
      new Operations.RenameField({ oldName: 'myText', newName: 'myBigText' })
    ]})
  ]);
});

test(`should generate the proper migration path for a field rename`, async function(t) {
  const r = new Migration(rename.one, rename.two);
  t.same(await r.down(), [
    new Operations.AlterModel({ name: 'test_table', fields: [
      new Operations.RenameField({ oldName: 'myBigText', newName: 'myText' })
    ]})
  ]);
});
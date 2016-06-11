import Migration from '../../../lib/db/migration';
import * as Operations from '../../../lib/db/operations';
import * as test from 'ava';
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

test(`should generate the proper migration path for a table add`, async function(t) {
  const r = new Migration(add.one, add.two);
  const table = add.two.tables[0];
  const idField = add.two.tables[0].fields[0];
  const expected = [
    new Operations.CreateModel({ name: table.tableName, fields: [
      new Operations.CreateField(idField)
    ]})
  ];
  t.same(await r.up(), expected);
});

test(`should generate the proper migration path for a table drop`, async function(t) {
  const r = new Migration(add.one, add.two);
  const table = add.two.tables[0];
  const expected = [
    new Operations.DropModel({ name: table.tableName })
  ];
  t.same(await r.down(), expected);
});

test(`should generate the proper migration path for a table rename`, async function(t) {
  const r = new Migration(rename.one, rename.two);
  const up = await r.up();
  const expected = [
    new Operations.RenameModel({ oldName: 'test_table', newName: 'test_table2' }),
    new Operations.AlterModel({ name: 'test_table2', fields: [
      new Operations.CreateField({ name: 'myText', type: 'text' }),
      new Operations.DropField({ name: 'myString' })
    ]})
  ];
  t.same(up, expected);
});

test(`should generate the proper migration path for a table un-rename`, async function(t) {
  const r = new Migration(rename.two, rename.one);
  const up = await r.up();
  const expected = [
    new Operations.RenameModel({ oldName: 'test_table2', newName: 'test_table' }),
    new Operations.AlterModel({ name: 'test_table', fields: [
      new Operations.CreateField({ name: 'myString', type: 'string', opts: { length: 255 } }),
      new Operations.DropField({ name: 'myText' })
    ]})
  ];
  t.same(up, expected);
});

test(`should generate reversible migration paths`, async function(t) {
  const r1 = new Migration(rename.one, rename.two);
  const r2 = new Migration(rename.two, rename.one);
  const res = await Promise.all([ r1.up(), r2.down() ]);
  t.same(...res);
})

test(`should generate reversible migration paths`, async function(t) {
  const r1 = new Migration(rename.three, rename.four);
  const r2 = new Migration(rename.four, rename.three);
  const res = await Promise.all([ r2.up(), r1.down() ]);
  t.same(...res);
})
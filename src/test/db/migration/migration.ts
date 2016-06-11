import Migration from '../../../lib/db/migration';
import * as test from 'ava';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';

test.before(t => {
  sinon.stub(inquirer, 'prompt', (q, cb) => {
    const obj = {};
    q.forEach(q => obj[q.name] = true);
    cb(obj);
  });
});

test.beforeEach(t => {
  t.context.log = console.log; 
  console.log = sinon.spy();
});

test.afterEach(t => {
  console.log = t.context.log;
});

test(`Should filter field props out of table.`, t => {
  const res = Migration.filterFields({
    app: 'myApp',
    tableName: 'myApp_foo',
    name: 'foo',
    fields: [
      { name: 'bar' },
      { name: 'baz' }
    ]
  })
  t.same(res, {
    app: 'myApp',
    tableName: 'myApp_foo',
    name: 'foo'
  });
});


test(`Should filter field props out of an array of tables.`, t => {
  const res = Migration.filterFields([{
    app: 'myApp',
    tableName: 'myApp_foo',
    name: 'foo',
    fields: [
      { name: 'bar' },
      { name: 'baz' }
    ]
  }])
  t.same(res, [{
    app: 'myApp',
    tableName: 'myApp_foo',
    name: 'foo'
  }]);
});

test(`Should log if the silent flag is off`, t => {
  Migration.silent = false;
  Migration.log('foobar');
  t.true(console.log['calledOnce']);
});
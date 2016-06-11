import * as test from 'ava';
import { Model } from 'objection';
import * as Models from '../fixtures/models';
import Migration from '../../lib/db/migration';
import * as Knex from 'knex';

test('should set tableName to function ctor name', t => {
  t.is(Models.One.tableName, 'myBlog_One');
});

test('should allow tableName to be set manually', t => {
  const M2 = Object.create(Models.One);
  M2.tableName = 'foobar';
  t.is(M2.tableName, 'foobar');
})

test('should generate ManyToMany relation mappings', t => {
  const actual = Models.Four.relationMappings;
  const expected = {
    modelClass: Models.Two,
    relation: Model.ManyToManyRelation,
    join: {
      from: 'myBlog_Four.id',
      to: 'myBlog_Two.myId',
      through: {
        modelClass: undefined,
        from: 'myBlog_Four_Two.fourId',
        to: 'myBlog_Four_Two.twoId'
      }
    }
  };
  t.same(actual.myManyToMany, expected);
});

test('should take props on instantiation', t => {
  const m = new Models.One({ myBoolean: true, myDate: new Date(), myDateTime: new Date() });
  t.same(m['myBoolean'], true);
});

test('should generate migration schema with specified id field', t => {
  const expected = {
    app: 'myBlog',
    fields: [
      {
        name: 'myId',
        opts: {
          primaryKey: true
        },
        type: 'bigincrements'
      },
      {
        name: 'myInteger',
        type: 'integer'
      },
      {
        name: 'myFloat',
        type: 'float'
      }
    ],
    name: 'Two',
    tableName: 'myBlog_Two'
  };
  t.same(Models.Two.toJSON(), expected);
});

test('should generate migration schema without specified id field', t => {
  const expected = {
    tableName: 'myBlog_One',
    name: 'One',
    app: 'myBlog',
    fields: [
      {
        name: 'id',
        type: 'bigincrements',
        opts: {
          primaryKey: true
        }
      },
      {
        name: 'myBoolean',
        type: 'boolean',
      },
      {
        name: 'myDate',
        type: 'date',
      },
      {
        name: 'myDateTime',
        type: 'datetime',
      }
    ]
  };
  t.same(Models.One.toJSON(), expected);
});

test('should fail to generate schema for model with multiple pks', t => {
  t.throws(() => Models.Five.toJSON());
});

test('should add a new record on #save()', async function (t) {
  // startup...
  const knex = Knex({ client: 'sqlite3', connection: { filename: ':memory:' } });

  Model.knex(knex);
  Models.One.app = 'myBlog';

  const m = new Migration({ tables: [] }, { tables: [Models.One.toJSON()] });
  Migration.run(knex, await m.up());

  const one = new Models.One({ myBoolean: 1, myDate: Date.now(), myDateTime: Date.now() });
  await one.save();
  const found = await Models.One.query().where('id', 1);

  // teardown...
  await knex.destroy();
  t.same(one, found[0]);
})
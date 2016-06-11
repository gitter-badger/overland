import Migration from '../../../lib/db/migration';
import * as test from 'ava';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';

import * as drop from '../fixtures/model/drop';
import * as rename from '../fixtures/model/rename';
import * as add from '../fixtures/model/add';

Migration.silent = true;

test.before(t => {
  sinon.stub(inquirer, 'prompt', (q, cb) => {
    const obj = {};
    q.forEach(q => obj[q.name] = true);
    cb(obj);
  });
});

test(`should correctly determine a table drop.`, async function(t) {

  const m = new Migration(drop.one, drop.two);

  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {
        test_table: true
      }
    },
    fields: {
      added: {},
      altered: {},
      deleted: {}
    }
  });
});

test(`should correctly determine a table rename.`, async function(t) {

  const m = new Migration(rename.one, rename.two);

  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {
        test_table: 'test_table2'
      },
      deleted: {}
    },
    fields: {
      added: {
        test_table2: {
          "myText": true
        }
      },
      altered: {},
      deleted: {
        test_table2: {
          "myString": true
        }
      }
    }
  });
});

test(`should not permit a table rename across apps.`, async function(t) {

  const m = new Migration(rename.three, rename.four);

  t.same(await m.schema(), {
    models: {
      added: {
        test2_table: true
      },
      altered: {},
      deleted: {
        test_table: true
      }
    },
    fields: {
      added: {
        test2_table: {
          id: true
        }
      },
      altered: {},
      deleted: {}
    }
  });
});

test(`should correctly determine a table add.`, async function(t) {

  const m = new Migration(add.one, add.two);

  t.same(await m.schema(), {
    models: {
      added: {
        test_table: true
      },
      altered: {},
      deleted: {}
    },
    fields: {
      added: {
        test_table: {
          id: true
        }
      },
      altered: {},
      deleted: {}
    }
  });
});
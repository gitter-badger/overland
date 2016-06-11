import Migration from '../../../lib/db/migration';
import * as test from 'ava';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';

import * as add from '../fixtures/field/add';
import * as alter from '../fixtures/field/alter';
import * as drop from '../fixtures/field/drop';
import * as rename from '../fixtures/field/rename';
import * as fkalter from '../fixtures/foreignKey/alter';
import * as fkdrop from '../fixtures/foreignKey/drop';

Migration.silent = true;

test.before(t => {
  sinon.stub(inquirer, 'prompt', (q, cb) => {
    const obj = {};
    q.forEach(q => obj[q.name] = true);
    cb(obj);
  });
});

test(`should correctly determine a field drop`, async function(t) {
  
  const m = new Migration(drop.one, drop.two);
  
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {}
    },
    fields: {
      added: {},
      altered: {},
      deleted: {
        test_table: { myText: true }
      }
    }
  });
});

test(`should correctly determine a field rename`, async function(t) {
  const m = new Migration(rename.one, rename.two);
  
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {}
    },
    fields: {
      added: {},
      altered: {
        test_table: {
          myText: 'myBigText' 
        }
      },
      deleted: {}
    }
  });
});

test(`should correctly determine a field add`, async function(t) {
  const m = new Migration(add.one, add.two);
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {}
    },
    fields: {
      added: {
        test_table: {
          myString: true,
          myText: true,
          myFloat: true,
          myJSON: true,
          myEnum: true
        }
      },
      altered: {},
      deleted: {}
    }
  });
});

test(`should correctly determine a fk retarget`, async function(t) {
  const m = new Migration(fkalter.one, fkalter.two);
  
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {
        test_table2: "test_table3"
      },
      deleted: {}
    },
    fields: {
      added: {},
      altered: {},
      deleted: {}
    }
  });
});

test(`should correctly determine a fk drop`, async function(t) {
  const m = new Migration(fkdrop.one, fkdrop.two);
  
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {
        test_table2: true
      }
    },
    fields: {
      added: {},
      altered: {},
      deleted: {
        test_table: {
          fk: true
        }
      }
    }
  });
});

test(`should drop and re-add a field instead of altering`, async function(t) {
  const m = new Migration(alter.one, alter.two);
  
  t.same(await m.schema(), {
    models: {
      added: {},
      altered: {},
      deleted: {}
    },
    fields: {
      added: {
        test_table: {
          myString: true,
          fk: true
        }
      },
      altered: {},
      deleted: {
        test_table: {
          myString: true,
          fk: true
        }
      }
    }
  });
});
export const one = {
  tables: [
    {
      tableName: 'test_table',
      name: 'table',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'bigincrements'
        },
        {
          name: 'myBoolean',
          type: 'boolean'
        }, 
        {
          name: 'myString',
          type: 'string',
          opts: {
            length: 255
          }
        }
      ]
    }
  ]
};

export const two = {
  tables: [
    {
      tableName: 'test_table2',
      name: 'table',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'bigincrements'
        },
        {
          name: 'myBoolean',
          type: 'boolean'
        },
        {
          name: 'myText',
          type: 'text'
        }
      ]
    }
  ]
};

export const three = {
  tables: [
    {
      tableName: 'test_table',
      name: 'table',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'bigincrements'
        }
      ]
    }
  ]
};

export const four = {
  tables: [
    {
      tableName: 'test2_table',
      name: 'table',
      app: 'test2',
      fields: [
        {
          name: 'id',
          type: 'bigincrements'
        }
      ]
    }
  ]
};
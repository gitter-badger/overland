export const one = {
  tables: [
    {
      tableName: 'test_table',
      name: 'table',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'biginteger',
          opts: {
            unsigned: true,
            primaryKey: true
          }
        }
      ]
    }
  ]
};

export const two = {
  tables: [
    {
      tableName: 'test_table',
      name: 'table',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'biginteger',
          opts: {
            unsigned: true,
            primaryKey: true
          }
        },
        {
          name: 'myString',
          type: 'string',
          opts: {
            length: 255,
            unique: true
          }
        },
        {
          name: 'myText',
          type: 'text'
        },
        {
          name: 'myFloat',
          type: 'float',
          opts: {
            precision: 1,
            scale: 5,
            nullable: false,
            defaultTo: 5.0
          }
        },
        {
          name: 'myJSON',
          type: 'jsonb'
        },
        {
          name: 'myEnum',
          type: 'enum',
          opts: {
            enumValues: [ 'foo', 'bar', 'baz' ]
          }
        }
      ]
    }
  ]
};
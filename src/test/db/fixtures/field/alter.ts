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
          name: 'myString',
          type: 'string',
          opts: {
            length: 254
          }
        },
        {
          name: 'fk',
          type: 'foreign',
          fk: {
            references: 'foo',
            inTable: 'test_table2'
          }
        }
      ]
    }
  ]
}

export const two = {
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
          name: 'myString',
          type: 'string',
          opts: {
            length: 255
          }
        },
        {
          name: 'fk',
          type: 'foreign',
          fk: {
            references: 'foo',
            inTable: 'test_table2',
            onDelete: 'cascade'
          }
        }
      ]
    }
  ]
}
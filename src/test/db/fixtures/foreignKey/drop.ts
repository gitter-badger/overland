export const one ={
  tables: [
    {
      tableName: 'test_table2',
      name: 'table2',
      app: 'test',
      fields: [
        {
          name: 'id',
          type: 'bigincrements'
        }
      ]
    },
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
          name: 'fk',
          type: 'foreign',
          fk: {
            inTable: 'test_table2',
            references: 'id'
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
          type: 'bigincrements'
        }
      ]
    }
  ]
};
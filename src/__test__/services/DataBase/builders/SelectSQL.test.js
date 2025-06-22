const SelectSQL = require('../../../../services/DataBase/builders/SelectSQL');

describe('SelectSQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn() },
         getTable: jest.fn(() => ({ getField: jest.fn(() => true) })),
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should build select query with default fields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      expect(q.selectClause).toBe('SELECT * FROM');
      expect(q.toString()).toMatch(/SELECT \* FROM/);
   });

   it('should build select query with custom fields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.select(['id', 'name']);
      expect(q.selectClause).toBe('SELECT id, name FROM');
   });

   it('should build ORDER BY clause', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.sort({ id: 'asc', name: 'desc' });
      expect(q.sortClause).toMatch(/ORDER BY/);
   });
});

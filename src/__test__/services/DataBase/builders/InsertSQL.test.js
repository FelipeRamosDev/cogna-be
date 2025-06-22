const InsertSQL = require('../../../../services/DataBase/builders/InsertSQL');

describe('InsertSQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }) },
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should build insert query and set values', () => {
      const q = new InsertSQL(dbMock, 'myschema', 'mytable');
      q.data({ a: 1, b: 2 });
      expect(q.insertClause).toMatch(/INSERT INTO/);
      expect(q.values).toEqual([1, 2]);
   });

   it('should throw if data is not an object', () => {
      const q = new InsertSQL(dbMock, 'myschema', 'mytable');
      expect(() => q.data(null)).toThrow();
   });

   it('should build toString with returning', () => {
      const q = new InsertSQL(dbMock, 'myschema', 'mytable');
      q.data({ a: 1 });
      expect(q.toString()).toMatch(/RETURNING/);
   });
});

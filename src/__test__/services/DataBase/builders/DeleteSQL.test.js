const DeleteSQL = require('../../../../services/DataBase/builders/DeleteSQL');

describe('DeleteSQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn() },
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should build delete query with returning', () => {
      const q = new DeleteSQL(dbMock, 'myschema', 'mytable');
      q.whereClause = 'WHERE id = $1';
      expect(q.toString()).toMatch(/DELETE FROM/);
   });

   it('should throw if no WHERE and not allowed', () => {
      const q = new DeleteSQL(dbMock, 'myschema', 'mytable');
      expect(() => q.toString()).toThrow();
      q.isAllowedNullWhere = true;
      expect(() => q.toString()).not.toThrow();
   });
});

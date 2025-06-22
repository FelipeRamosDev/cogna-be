const UpdateSQL = require('../../../../services/DataBase/builders/UpdateSQL');

describe('UpdateSQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn() },
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should build update query and set values', () => {
      const q = new UpdateSQL(dbMock, 'myschema', 'mytable');
      q.set({ a: 1, b: 2 });
      expect(q.setClause).toMatch(/SET/);
      expect(q.values).toEqual([1, 2]);
   });

   it('should throw if set is called with invalid data', () => {
      const q = new UpdateSQL(dbMock, 'myschema', 'mytable');
      expect(() => q.set(null)).toThrow();
      expect(() => q.set({})).toThrow();
   });

   it('should throw if no WHERE and not allowed', () => {
      const q = new UpdateSQL(dbMock, 'myschema', 'mytable');
      q.set({ a: 1 });
      expect(() => q.toString()).toThrow();
      q.isAllowedNullWhere = true;
      expect(() => q.toString()).not.toThrow();
   });
});

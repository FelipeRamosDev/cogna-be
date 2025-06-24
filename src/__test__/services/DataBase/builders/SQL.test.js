const SQL = require('../../../../services/DataBase/builders/SQL');

describe('SQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }], rowCount: 1 }) },
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should throw if no valid db is provided', () => {
      expect(() => new SQL({})).toThrow();
   });

   it('should build tablePath and validate identifiers', () => {
      const q = new SQL(dbMock, 'myschema', 'mytable');
      expect(q.tablePath).toBe('myschema.mytable');
      expect(() => q.charsVerifier('bad-name!')).toThrow();
   });

   it('should build WHERE clause for AND/OR', () => {
      const q = new SQL(dbMock, 's', 't');
      q.where({ a: 1, b: { operator: '>', value: 2 } });
      expect(q.whereClause).toMatch(/WHERE/);
      q.where([{ a: 1 }, { b: { operator: '<', value: 2 } }]);
      expect(q.whereClause).toMatch(/WHERE/);
   });

   it('should build LIMIT clause', () => {
      const q = new SQL(dbMock, 's', 't').limit(5);
      expect(q.limitClause).toBe('LIMIT 5');
      expect(() => q.limit(0)).toThrow();
   });

   it('should build RETURNING clause', () => {
      const q = new SQL(dbMock, 's', 't').returning(['id', 'name']);
      expect(q.returningClause).toBe('RETURNING id, name');
   });

   it('should call exec and return data', async () => {
      const q = new SQL(dbMock, 's', 't');
      const result = await q.exec();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.count).toBe(1);
   });

   it('should handle exec errors', async () => {
      dbMock.pool.query.mockRejectedValueOnce({ message: 'fail', code: '22P02' });
      const q = new SQL(dbMock, 's', 't');
      const result = await q.exec();
      expect(result.error).toBe(true);
      expect(dbMock.toError).toHaveBeenCalled();
   });
});

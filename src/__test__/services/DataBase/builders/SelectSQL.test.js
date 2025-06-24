const SelectSQL = require('../../../../services/DataBase/builders/SelectSQL');

describe('SelectSQL', () => {
   let dbMock;
   beforeEach(() => {
      dbMock = {
         pool: { query: jest.fn() },
         getField: jest.fn(() => ({
            relatedField: { schema: 'otherschema', table: 'othertable', field: 'id', tablePath: 'otherschema.othertable' },
            isPrimaryKey: false,
            isForeignKey: false,
            isUnique: false,
            isNullable: true,
            type: 'string',
            name: 'id',
            tablePath: 'myschema.mytable'
         })),
         getTable: jest.fn(() => ({ getField: jest.fn(() => true) })),
         toError: jest.fn(msg => ({ error: true, message: msg }))
      };
   });

   it('should build select query with default fields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      expect(q.selectClause).toBe('');
      expect(q.toString()).toMatch(/SELECT \*/);
   });

   it('should build select query with custom fields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.selectFields(['id', 'name']);
      expect(q.selectClause).toBe('SELECT id, name');
   });

   it('should build ORDER BY clause', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.sort({ id: 'asc', name: 'desc' });
      expect(q.sortClause).toMatch(/ORDER BY/);
   });

   it('should build select query with alias using selectFields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.selectFields([['id', 'my_id'], ['name', 'my_name']]);
      expect(q.selectClause).toBe('SELECT id AS my_id, name AS my_name');
   });

   it('should build select query with table.* and custom fields', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.selectFields(['mytable.*', 'other_table.name']);
      expect(q.selectClause).toBe('SELECT mytable.*, other_table.name');
   });

   it('should call from with alias and multiple tables', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.from([
         { path: 'myschema.mytable', alias: 't1' },
         { path: 'otherschema.othertable', alias: 't2' }
      ]);
      expect(q.fromClause).toBe('FROM myschema.mytable AS t1, otherschema.othertable AS t2');
   });

   it('should build a JOIN and ON clause', () => {
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.from([{ path: 'myschema.mytable', alias: 't1' }]);
      q.join('otherschema.othertable', 'LEFT', 't2');
      q.on('t1.id', 't2.ref_id');
      expect(q.joinClause).toBe('LEFT JOIN otherschema.othertable AS t2');
      expect(q.onClause).toBe('ON t1.id = t2.ref_id');
   });

   it('should build a query using populate', () => {
      // Mock getField to return a relatedField
      dbMock.getTable = jest.fn(() => ({
         getField: jest.fn(() => ({
            relatedField: { schema: 'otherschema', table: 'othertable', field: 'id', tablePath: 'otherschema.othertable' }
         }))
      }));
      const q = new SelectSQL(dbMock, 'myschema', 'mytable');
      q.populate('author_id', ['othertable.first_name', 'othertable.last_name']);
      expect(q.selectClause).toMatch(/mytable\.\*, othertable\.first_name, othertable\.last_name/);
      expect(q.fromClause).toMatch(/FROM myschema\.mytable AS mytable/);
      expect(q.joinClause).toMatch(/JOIN otherschema\.othertable/);
      expect(q.onClause).toMatch(/ON mytable\.author_id = othertable\.id/);
   });
});

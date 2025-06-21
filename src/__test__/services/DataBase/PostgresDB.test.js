const Schema = require('../../../models/Schema');
const PostgresDB = require('../../../services/DataBase/PostgresDB');
const { Pool } = require('pg');

jest.mock('pg', () => {
   const mPool = {
      query: jest.fn(),
      end: jest.fn()
   };
   return { Pool: jest.fn(() => mPool) };
});

describe('PostgresDB', () => {
   let db;
   let poolMock;

   beforeEach(() => {
      Pool.mockClear();
      db = new PostgresDB({
         dbName: 'testdb',
         host: 'localhost',
         password: 'secret',
         schemas: [new Schema({ name: 'schema', tables: [{ name: 'table', fields: [] }] })]
      });
      poolMock = db.pool;
      poolMock.query.mockReset();
   });

   describe('constructor', () => {
      it('should initialize with default values', () => {
         expect(db.type).toBe('postgres');
         expect(db.user).toBe('postgres');
         expect(db.port).toBe(5432);
         expect(Pool).toHaveBeenCalledWith({
            user: 'postgres',
            database: 'testdb',
            host: 'localhost',
            password: 'secret',
            port: 5432
         });
      });
   });

   describe('buildWhere', () => {
      it('should build AND where clause from object', () => {
         const cond = { id: { value: 1 }, name: { value: 'foo', operator: 'LIKE' } };
         expect(db.buildWhere(cond)).toBe('id = $1 AND name LIKE $2');
      });

      it('should build OR where clause from array', () => {
         const cond = [
            ['id', { value: 1 }],
            ['name', { value: 'foo', operator: 'LIKE' }]
         ];
         expect(db.buildWhere(cond)).toBe('id = $1 OR name LIKE $2');
      });

      it('should return empty string for empty input', () => {
         expect(db.buildWhere()).toBe('');
      });
   });

   describe('buildSet', () => {
      it('should build SET clause', () => {
         expect(db.buildSet({ a: 1, b: 2 })).toBe('a = $1, b = $2');
      });
      it('should return empty string for empty object', () => {
         expect(db.buildSet({})).toBe('');
      });
   });

   describe('getConditionValues', () => {
      it('should extract values from object', () => {
         expect(db.getConditionValues({ a: { value: 1 }, b: { value: 2 } })).toEqual([1, 2]);
      });
      it('should extract values from array', () => {
         expect(db.getConditionValues([['a', { value: 1 }], ['b', { value: 2 }]])).toEqual([1, 2]);
      });
      it('should return empty array for invalid input', () => {
         expect(db.getConditionValues(null)).toEqual([]);
      });
   });

   describe('create', () => {
      it('should insert and return record', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1, name: 'foo' }] });
         const result = await db.create('table', { name: 'foo' });
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual({ id: 1, name: 'foo' });
      });

      it('should throw error for invalid data', async () => {
         await expect(db.create('table', null)).rejects.toEqual(expect.objectContaining({ error: true }));
      });

      it('should return error object on query error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const result = await db.create('table', { name: 'foo' });
         expect(result).toEqual(expect.objectContaining({ error: true, message: 'fail' }));
      });
   });

   describe('read', () => {
      it('should select and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1 }] });
         const { data } = await db.query('schema', 'table').where({ id: 1 }).exec();
         const result = data;
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual([{ id: 1 }]);
      });

      it('should return empty array on error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const res = await db.query('schema', 'table').where({ id: 1 }).exec();

         expect(res).toHaveProperty('error', true);
         expect(res).toHaveProperty('message', 'Error reading records from database: fail');
      });
   });

   describe('update', () => {
      it('should update and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1, name: 'bar' }] });
         const result = await db.update('table', { id: { value: 1 } }, { name: 'bar' });
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual([{ id: 1, name: 'bar' }]);
      });
   });

   describe('delete', () => {
      it('should delete and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1 }] });
         const result = await db.delete('table', { id: { value: 1 } });
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual([{ id: 1 }]);
      });

      it('should return undefined if no where clause', async () => {
         const result = await db.delete('table', {});
         expect(result).toBeUndefined();
      });

      it('should return undefined on query error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const result = await db.delete('table', { id: { value: 1 } });
         expect(result).toBeUndefined();
      });
   });

   describe('toError', () => {
      it('should return error object from string', () => {
         expect(db.toError('fail', 400)).toEqual({ code: 400, error: true, message: 'fail' });
      });
      it('should return error object from Error', () => {
         expect(db.toError(new Error('fail'))).toEqual(expect.objectContaining({ error: true, message: 'fail' }));
      });
   });

   describe('createSchema', () => {
      it('should call pool.query for schema and tables', async () => {
         const schema = {
            name: 'myschema',
            buildCreateSchemaQuery: jest.fn(() => 'CREATE SCHEMA myschema'),
            tables: [
               {
                  name: 'mytable',
                  buildCreateTableQuery: jest.fn(() => 'CREATE TABLE myschema.mytable()'),
                  fields: []
               }
            ]
         };
         db.createTable = jest.fn();
         poolMock.query.mockResolvedValue({});
         await db.createSchema(schema);
         expect(poolMock.query).toHaveBeenCalledWith('CREATE SCHEMA myschema');
         expect(db.createTable).toHaveBeenCalledWith('myschema', schema.tables[0]);
      });

      it('should handle error in schema creation', async () => {
         const schema = {
            name: 'myschema',
            buildCreateSchemaQuery: jest.fn(() => 'CREATE SCHEMA myschema'),
            tables: []
         };
         poolMock.query.mockRejectedValueOnce(new Error('fail'));
         const spy = jest.spyOn(db, 'toError');
         await db.createSchema(schema);
         expect(spy).toHaveBeenCalledWith('Error creating schema: fail');
      });

      it('should handle error in table creation', async () => {
         const schema = {
            name: 'myschema',
            buildCreateSchemaQuery: jest.fn(() => 'CREATE SCHEMA myschema'),
            tables: [
               {
                  name: 'mytable',
                  buildCreateTableQuery: jest.fn(() => 'CREATE TABLE myschema.mytable()'),
                  fields: []
               }
            ]
         };
         poolMock.query.mockResolvedValue({});
         db.createTable = jest.fn(() => { throw new Error('fail'); });
         const spy = jest.spyOn(db, 'toError');
         await db.createSchema(schema);
         expect(spy).toHaveBeenCalledWith('Error creating tables: fail');
      });
   });

   describe('createTable', () => {
      it('should create table and sync', async () => {
         const table = {
            name: 't',
            buildCreateTableQuery: jest.fn(() => 'CREATE TABLE s.t()'),
            fields: []
         };
         db.syncTable = jest.fn();
         poolMock.query.mockResolvedValue({});
         await db.createTable('s', table);
         expect(poolMock.query).toHaveBeenCalledWith('CREATE TABLE s.t()');
         expect(db.syncTable).toHaveBeenCalledWith('t', 's', []);
      });

      it('should handle error', async () => {
         const table = {
            name: 't',
            buildCreateTableQuery: jest.fn(() => 'CREATE TABLE s.t()'),
            fields: []
         };
         poolMock.query.mockRejectedValueOnce(new Error('fail'));
         const spy = jest.spyOn(db, 'toError');
         await db.createTable('s', table);
         expect(spy).toHaveBeenCalledWith('Error creating table t in schema s: fail');
      });
   });

   describe('syncTable', () => {
      it('should add and drop columns as needed', async () => {
         poolMock.query
            .mockResolvedValueOnce({ rows: [{ column_name: 'oldcol', data_type: 'text', is_nullable: 'YES' }] }) // current columns
            .mockResolvedValue({}); // for alter table
         await db.syncTable('t', 's', [{ name: 'newcol', type: 'int', notNull: true }]);
         expect(poolMock.query).toHaveBeenCalledWith(
            'ALTER TABLE s.t ADD COLUMN newcol int NOT NULL'
         );
         expect(poolMock.query).toHaveBeenCalledWith(
            'ALTER TABLE s.t DROP COLUMN oldcol'
         );
      });
   });
});
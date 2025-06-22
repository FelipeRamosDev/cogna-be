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

   describe('insert', () => {
      it('should insert and return record', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1, name: 'foo' }] });
         const { data } = await db.insert('schema', 'table').data({ name: 'foo' }).exec();
         const [result] = data;
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual({ id: 1, name: 'foo' });
      });

      it('should throw error for invalid data', async () => {
         const result = await db.insert('schema', 'table', null).exec();
         await expect(result).toEqual({"code": 500, "error": true, "message": "No data returned from the database."});
      });

      it('should return error object on query error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const result = await db.insert('schema', 'table').data({ name: 'foo' }).exec();
         expect(result).toEqual(expect.objectContaining({ error: true, message: 'fail' }));
      });
   });

   describe('select', () => {
      it('should select and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1 }] });
         const { data } = await db.select('schema', 'table').where({ id: 1 }).exec();
         const result = data;
         expect(poolMock.query).toHaveBeenCalled();
         expect(result).toEqual([{ id: 1 }]);
      });

      it('should return empty array on error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const res = await db.select('schema', 'table').where({ id: 1 }).exec();

         expect(res).toHaveProperty('error', true);
         expect(res).toHaveProperty('message', 'fail');
      });
   });

   describe('update', () => {
      it('should update and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1, name: 'bar' }] });
         const result = await db.update('schema', 'table').set({ name: 'bar' }).where({ id: 1 }).exec();
         expect(poolMock.query).toHaveBeenCalled();
         expect(result.data).toEqual([{ id: 1, name: 'bar' }]);
      });
   });

   describe('delete', () => {
      it('should delete and return rows', async () => {
         poolMock.query.mockResolvedValue({ rows: [{ id: 1 }] });
         const result = await db.delete('schema', 'table').where({ id: 1 }).exec();
         expect(poolMock.query).toHaveBeenCalled();
         expect(result.data).toEqual([{ id: 1 }]);
      });

      it('should return undefined if no where clause', async () => {
         const result = await db.delete('schema', 'table').where({}).exec();
         expect(result).toHaveProperty('error', true);
         expect(result).toHaveProperty('message', 'Where clause is required for delete queries unless allowNullWhere is set.');
      });

      it('should return undefined on query error', async () => {
         poolMock.query.mockRejectedValue(new Error('fail'));
         const result = await db.delete('schema', 'table').where({ id: 1 }).exec();
         expect(result).toHaveProperty('error', true);
         expect(result).toHaveProperty('message', 'fail');
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
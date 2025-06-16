const Table = require('../../models/Table');
const Field = require('../../models/Field');

jest.mock('../../models/Field');

describe('Table', () => {
   beforeEach(() => {
      Field.mockClear();
      Field.mockImplementation((field) => ({
         ...field,
         buildDefinitionSQL: jest.fn().mockReturnValue(`${field.name} ${field.type}`)
      }));
   });

   describe('constructor', () => {
      it('should throw if name is not provided', () => {
         expect(() => new Table({ fields: [] })).toThrow('Table name is required');
         expect(() => new Table()).toThrow('Table name is required');
      });

      it('should set name and fields correctly', () => {
         const fields = [{ name: 'id', type: 'INT' }, { name: 'name', type: 'VARCHAR(255)' }];
         const table = new Table({ name: 'users', fields });
         expect(table.name).toBe('users');
         expect(Field).toHaveBeenCalledTimes(2);
         expect(table.fields.length).toBe(2);
         expect(table.fields[0].name).toBe('id');
         expect(table.fields[1].name).toBe('name');
      });

      it('should default fields to empty array if not provided', () => {
         const table = new Table({ name: 'empty' });
         expect(table.fields).toEqual([]);
      });
   });

   describe('buildCreateTableQuery', () => {
      it('should throw if schemaName is not provided', () => {
         const table = new Table({ name: 'users', fields: [] });
         expect(() => table.buildCreateTableQuery()).toThrow('Table name and schema name is required to build the "create table" query');
      });

      it('should throw if table name is missing', () => {
         // This is already covered by constructor, but for completeness:
         expect(() => new Table({ fields: [] }).buildCreateTableQuery('myschema')).toThrow();
      });

      it('should build correct SQL for table with fields', () => {
         const fields = [
            { name: 'id', type: 'INT' },
            { name: 'name', type: 'VARCHAR(255)' }
         ];
         const table = new Table({ name: 'users', fields });
         const sql = table.buildCreateTableQuery('myschema');
         expect(sql).toBe('CREATE TABLE IF NOT EXISTS myschema.users (id INT, name VARCHAR(255));');
         expect(table.fields[0].buildDefinitionSQL).toHaveBeenCalled();
         expect(table.fields[1].buildDefinitionSQL).toHaveBeenCalled();
      });

      it('should build SQL with no fields', () => {
         const table = new Table({ name: 'empty', fields: [] });
         const sql = table.buildCreateTableQuery('myschema');
         expect(sql).toBe('CREATE TABLE IF NOT EXISTS myschema.empty ();');
      });
   });
});

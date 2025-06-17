const Schema = require('../../models/Schema');
const Table = require('../../models/Table');

jest.mock('../../models/Table');

describe('Schema', () => {
   beforeEach(() => {
      Table.mockClear();
   });

   describe('constructor', () => {
      it('should create a Schema instance with valid name and tables', () => {
         const tables = [{ name: 'users' }, { name: 'posts' }];
         const schema = new Schema({ name: 'myschema', tables });

         expect(schema.name).toBe('myschema');
         expect(Array.isArray(schema.tables)).toBe(true);
         expect(schema.tables.length).toBe(2);
         expect(Table).toHaveBeenCalledTimes(2);
         expect(Table).toHaveBeenCalledWith({ name: 'users' });
         expect(Table).toHaveBeenCalledWith({ name: 'posts' });
      });

      it('should default tables to empty array if not provided', () => {
         const schema = new Schema({ name: 'myschema' });
         expect(schema.tables).toEqual([]);
         expect(Table).not.toHaveBeenCalled();
      });

      it('should throw if name is missing', () => {
         expect(() => new Schema({})).toThrow(
            "Schema constructor requires a valid 'name' property of type string."
         );
      });

      it('should throw if name is not a string', () => {
         expect(() => new Schema({ name: 123 })).toThrow(
            "Schema constructor requires a valid 'name' property of type string."
         );
      });
   });

   describe('buildCreateSchemaQuery', () => {
      it('should return correct CREATE SCHEMA query', () => {
         const schema = new Schema({ name: 'myschema' });
         expect(schema.buildCreateSchemaQuery()).toBe('CREATE SCHEMA IF NOT EXISTS myschema;');
      });

      it('should throw if name is missing', () => {
         const schema = Object.create(Schema.prototype);
         schema.name = '';
         expect(() => schema.buildCreateSchemaQuery()).toThrow(
            'Schema name is required to build the "create schema" query'
         );
      });
   });
});

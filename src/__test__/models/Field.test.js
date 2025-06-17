const Field = require('../../models/Field');

describe('Field', () => {
   describe('constructor', () => {
      it('should create a Field with required properties', () => {
         const field = new Field({ name: 'id', type: 'INTEGER' });
         expect(field.name).toBe('id');
         expect(field.type).toBe('INTEGER');
         expect(field.notNull).toBe(false);
         expect(field.unique).toBe(false);
         expect(field.primaryKey).toBe(false);
         expect(field.autoIncrement).toBe(false);
         expect(field.defaultValue).toBeUndefined();
      });

      it('should throw if name is missing', () => {
         expect(() => new Field({ type: 'INTEGER' })).toThrow('Field name is required');
      });

      it('should throw if name is not a string', () => {
         expect(() => new Field({ name: 123, type: 'INTEGER' })).toThrow('Field name is required');
      });

      it('should set boolean properties correctly', () => {
         const field = new Field({
            name: 'email',
            type: 'VARCHAR',
            notNull: true,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
         });
         expect(field.notNull).toBe(true);
         expect(field.unique).toBe(true);
         expect(field.primaryKey).toBe(true);
         expect(field.autoIncrement).toBe(true);
      });

      it('should set defaultValue if provided', () => {
         const field = new Field({ name: 'createdAt', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' });
         expect(field.defaultValue).toBe('CURRENT_TIMESTAMP');
      });
   });

   describe('buildDefinitionSQL', () => {
      it('should build SQL with type only', () => {
         const field = new Field({ name: 'username', type: 'VARCHAR' });
         expect(field.buildDefinitionSQL()).toBe('username VARCHAR');
      });

      it('should include PRIMARY KEY and SERIAL', () => {
         const field = new Field({ name: 'id', type: 'INTEGER', primaryKey: true });
         expect(field.buildDefinitionSQL()).toBe('id INTEGER SERIAL PRIMARY KEY');
      });

      it('should include UNIQUE', () => {
         const field = new Field({ name: 'email', type: 'VARCHAR', unique: true });
         expect(field.buildDefinitionSQL()).toBe('email VARCHAR UNIQUE');
      });

      it('should include AUTOINCREMENT', () => {
         const field = new Field({ name: 'id', type: 'INTEGER', autoIncrement: true });
         expect(field.buildDefinitionSQL()).toBe('id INTEGER AUTOINCREMENT');
      });

      it('should include NOT NULL', () => {
         const field = new Field({ name: 'username', type: 'VARCHAR', notNull: true });
         expect(field.buildDefinitionSQL()).toBe('username VARCHAR NOT NULL');
      });

      it('should include DEFAULT CURRENT_TIMESTAMP', () => {
         const field = new Field({ name: 'createdAt', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' });
         expect(field.buildDefinitionSQL()).toBe('createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      });

      it('should include DEFAULT for string value', () => {
         const field = new Field({ name: 'status', type: 'VARCHAR', defaultValue: 'active' });
         expect(field.buildDefinitionSQL()).toBe("status VARCHAR DEFAULT 'active'");
      });

      it('should include DEFAULT for number value', () => {
         const field = new Field({ name: 'age', type: 'INTEGER', defaultValue: 18 });
         expect(field.buildDefinitionSQL()).toBe('age INTEGER DEFAULT 18');
      });

      it('should combine all constraints', () => {
         const field = new Field({
            name: 'id',
            type: 'INTEGER',
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            notNull: true,
            defaultValue: 1,
         });
         expect(field.buildDefinitionSQL()).toBe('id INTEGER SERIAL PRIMARY KEY UNIQUE AUTOINCREMENT NOT NULL DEFAULT 1');
      });

      it('should not include DEFAULT if defaultValue is undefined or null', () => {
         const field1 = new Field({ name: 'foo', type: 'TEXT', defaultValue: undefined });
         const field2 = new Field({ name: 'bar', type: 'TEXT', defaultValue: null });
         expect(field1.buildDefinitionSQL()).toBe('foo TEXT');
         expect(field2.buildDefinitionSQL()).toBe('bar TEXT');
      });
   });
});

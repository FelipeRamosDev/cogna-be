const DataBase = require('../../../services/DataBase/DataBase');
const product_schema = require('../../../schemas/products_schema');

describe('DataBase Class', () => {
   const schema = product_schema;
   let db;

   beforeEach(() => {
      db = new DataBase({
         dbName: 'test-db',
         host: 'localhost',
         password: '1234',
         schemas: [ schema ]
      });
   });

   it('should initialize with provided setup values', () => {
      expect(db.dbName).toBe('test-db');
      expect(db.host).toBe('localhost');
      expect(db.password).toBe('1234');
      expect(db.schemas).toEqual(new Map([[schema.name, schema]]));
      expect(db.pool).toBeNull();
   });

   it('should throw error for createSchema()', async () => {
      await expect(db.createSchema()).rejects.toThrow('Method createSchema is implemented in PostgresDB or MongoDB');
   });

   it('should throw error for create()', async () => {
      await expect(db.create()).rejects.toThrow('Method create is implemented in PostgresDB or MongoDB');
   });

   it('should throw error for read()', async () => {
      await expect(db.read()).rejects.toThrow('Method read is implemented in PostgresDB or MongoDB');
   });

   it('should throw error for update()', async () => {
      await expect(db.update()).rejects.toThrow('Method update is implemented in PostgresDB or MongoDB');
   });

   it('should throw error for delete()', async () => {
      await expect(db.delete()).rejects.toThrow('Method delete is implemented in PostgresDB or MongoDB');
   });
});

/**
 * Base class for database services.
 *
 * This class defines the interface and common properties for SQL and NoSQL databases.
 * CRUD and schema methods must be implemented in specific subclasses (e.g., PostgresDB, MongoDB).
 *
 * @class DataBase
 */
class DataBase {
   /**
    * 
    * @param {object} setup - Database configuration object.
    * @param {string} [setup.dbName='default-db'] - Database name.
    * @param {string} [setup.host='0.0.0.0'] - Database host.
    * @param {string} [setup.password=''] - Database password.
    * @param {Function} [setup.onReady] - Callback function to execute when the connection is ready.
    *
    */
   constructor(setup = {}) {
      const {
         dbName = 'default-db',
         host = '0.0.0.0',
         password = '',
         schemas = new Map(),
         onReady = () => {}
      } = setup;

      this.dbName = dbName;
      this.host = host;
      this.password = password;
      this.schemas = new Map();
      this.onReady = onReady;
      this.pool = null;

      schemas.map(schema => this.schemas.set(schema.name, schema));
   }

   /**
    * Returns a schema object by name.
    * @param {string} schemaName - The name of the schema.
    * @returns {Object} The schema object.
    * @throws {Error} If schemaName is not provided or schema is not found.
    */
   getSchema(schemaName) {
      if (!schemaName) {
         throw new Error('Schema name is required.');
      }

      const schema = this.schemas.get(schemaName);
      if (!schema) {
         throw new Error(`Schema ${schemaName} not found.`);
      }

      return schema;
   }

   /**
    * Returns a table object by full path (schema.table).
    * @param {string} tablePath - The table path in the format 'schema.table'.
    * @returns {Object} The table object.
    * @throws {Error} If the table path is invalid or table is not found.
    */
   getTable(tablePath) {
      const [ schemaName, tableName ] = tablePath.split('.');
      if (!schemaName || !tableName) {
         throw new Error(`Invalid table name format: ${tablePath}. Expected format is 'schema.table'.`);
      }

      const schema = this.getSchema(schemaName);
      const table = schema.getTable(tableName);
      if (!table) {
         throw new Error(`Table ${tableName} not found in schema ${schemaName}.`);
      }

      return table;
   }

   /**
    * Abstract method to create a schema. Must be implemented in subclasses.
    * @throws {Error} Always throws unless implemented in subclass.
    */
   async createSchema() {
      throw new Error('Method createSchema is implemented in PostgresDB or MongoDB');
   }

   /**
    * Abstract method to create a record. Must be implemented in subclasses.
    * @throws {Error} Always throws unless implemented in subclass.
    */
   async create() {
      throw new Error('Method create is implemented in PostgresDB or MongoDB');
   }

   /**
    * Abstract method to select records. Must be implemented in subclasses.
    * @throws {Error} Always throws unless implemented in subclass.
    */
   async select() {
      throw new Error('Method read is implemented in PostgresDB or MongoDB');
   }

   /**
    * Abstract method to update records. Must be implemented in subclasses.
    * @throws {Error} Always throws unless implemented in subclass.
    */
   async update() {
      throw new Error('Method update is implemented in PostgresDB or MongoDB');
   }

   /**
    * Abstract method to delete records. Must be implemented in subclasses.
    * @throws {Error} Always throws unless implemented in subclass.
    */
   async delete() {
      throw new Error('Method delete is implemented in PostgresDB or MongoDB');
   }
}

module.exports = DataBase;

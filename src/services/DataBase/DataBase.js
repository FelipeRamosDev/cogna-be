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

   async createSchema() {
      throw new Error('Method createSchema is implemented in PostgresDB or MongoDB');
   }

   async create() {
      throw new Error('Method create is implemented in PostgresDB or MongoDB');
   }

   async read() {
      throw new Error('Method read is implemented in PostgresDB or MongoDB');
   }

   async update() {
      throw new Error('Method update is implemented in PostgresDB or MongoDB');
   }

   async delete() {
      throw new Error('Method delete is implemented in PostgresDB or MongoDB');
   }
}

module.exports = DataBase;

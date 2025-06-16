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
         schemas = [],
         onReady = () => {}
      } = setup;

      this.dbName = dbName;
      this.host = host;
      this.password = password;
      this.schemas = schemas;
      this.onReady = onReady;
      this.pool = null;
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

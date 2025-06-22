const Table = require('./Table');

/**
 * Schema class represents a database schema containing multiple tables.
 * It initializes with a name and an array of table definitions.
 * Provides methods to retrieve tables and build SQL for schema creation.
 *
 * @class Schema
 * @param {Object} setup - The setup object for the schema.
 * @param {string} setup.name - The name of the schema.
 * @param {Table[]} setup.tables - The tables in the schema.
 */
class Schema {
   /**
    * Creates a new Schema instance.
    * @param {Object} setup - The setup object for the schema.
    */
   constructor(setup) {
      const { name, tables = [] } = setup;

      if (!name || typeof name !== 'string') {
         throw new Error("Schema constructor requires a valid 'name' property of type string.");
      }

      this.name = name;
      this.tables = new Map();
      
      tables.map(table => {
         const newTable = new Table(table);
         this.tables.set(table.name, newTable);
      });
   }

   /**
    * Returns a table object by name from this schema.
    * @param {string} tableName - The name of the table.
    * @returns {Table} The table object.
    * @throws {Error} If tableName is not provided or table is not found.
    */
   getTable(tableName) {
      if (!tableName || typeof tableName !== 'string') {
         throw new Error("getTable method requires a valid 'tableName' parameter of type string.");
      }

      const table = this.tables.get(tableName);
      if (!table) {
         throw new Error(`Table ${tableName} not found in schema ${this.name}.`);
      }

      return table;
   }

   /**
    * Builds the SQL query to create this schema if it does not exist.
    * @returns {string} The SQL CREATE SCHEMA query.
    * @throws {Error} If schema name is not set.
    */
   buildCreateSchemaQuery() {
      if (!this.name) {
         throw new Error('Schema name is required to build the "create schema" query');
      }

      return `CREATE SCHEMA IF NOT EXISTS ${this.name};`;
   }
}

module.exports = Schema;

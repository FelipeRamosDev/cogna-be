const Table = require('./Table');

/**
 * Schema class represents a database schema containing multiple tables.
 * It initializes with a name and an array of table definitions.
 * 
 * @class Schema
 * @param {Object} setup - The setup object for the schema.
 * @param {string} setup.name - The name of the schema.
 * @param {Table[]} setup.tables - The tables in the schema.
 */
class Schema {
   constructor(setup) {
      const { name, tables = [] } = setup;

      if (!name || typeof name !== 'string') {
         throw new Error("Schema constructor requires a valid 'name' property of type string.");
      }

      this.name = name;
      this.tables = tables.map(table => new Table(table));
   }

   buildCreateSchemaQuery() {
      if (!this.name) {
         throw new Error('Schema name is required to build the "create schema" query');
      }

      return `CREATE SCHEMA IF NOT EXISTS ${this.name};`;
   }
}

module.exports = Schema;

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
   constructor (setup) {
      const { name, tables = [] } = setup;

      this.name = name;
      this.tables = tables.map(table => new Table(table));
   }
}

module.exports = Schema;

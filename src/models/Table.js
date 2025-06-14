const Field = require("./Field");

/**
 * Table class represents a database table with a name and fields.
 * It initializes with a name and an array of field definitions.
 *
 * @class Table
 * @param {Object} setup - The setup object for the table.
 * @param {string} setup.name - The name of the table.
 * @param {Field[]} setup.fields - The fields in the table.
 */
class Table {
   constructor(setup = {}) {
      const { name, fields = [] } = setup;

      if (!name) {
         throw new Error('Table name is required');
      }

      this.name = name;
      this.fields = fields.map(field => new Field(field));
   }
}

module.exports = Table;

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

   getField(fieldName) {
      if (!fieldName || typeof fieldName !== 'string') {
         throw new Error("getField method requires a valid 'fieldName' parameter of type string.");
      }

      const field = this.fields.find(f => f.name === fieldName);
      if (!field) {
         throw new Error(`Field ${fieldName} not found in table ${this.name}.`);
      }

      return field;
   }

   buildCreateTableQuery(schemaName) {
      if (!schemaName || !this.name) {
         throw new Error('Table name and schema name is required to build the "create table" query');
      }

      const fieldsDefinition = this.fields.map(field => field.buildDefinitionSQL()).join(', ');
      return `CREATE TABLE IF NOT EXISTS ${schemaName}.${this.name} (${fieldsDefinition});`;
   }
}

module.exports = Table;

const ErrorDatabase = require("./errors/ErrorDatabase");
const Field = require("./Field");

/**
 * Table class represents a database table with a name and fields.
 * It initializes with a name and an array of field definitions.
 * Provides methods to retrieve fields and build SQL for table creation.
 *
 * @class Table
 * @param {Object} setup - The setup object for the table.
 * @param {string} setup.name - The name of the table.
 * @param {Field[]} setup.fields - The fields in the table.
 */
class Table {
   /**
    * Creates a new Table instance.
    * @param {Object} setup - The setup object for the table.
    */
   constructor(setup = {}) {
      const { name, fields = [] } = setup;

      if (!name) {
         throw new ErrorDatabase('Table name is required', 'TABLE_NAME_REQUIRED');
      }

      this.name = name;
      this.fields = fields.map(field => new Field(field));
   }

   /**
    * Returns a field object by name from this table.
    * @param {string} fieldName - The name of the field.
    * @returns {Field} The field object.
    * @throws {ErrorDatabase} If fieldName is not provided or field is not found.
    */
   getField(fieldName) {
      if (!fieldName || typeof fieldName !== 'string') {
         throw new ErrorDatabase('getField method requires a valid "fieldName" parameter of type string.', 'FIELD_NAME_REQUIRED');
      }

      const field = this.fields.find(f => f.name === fieldName);
      if (!field) {
         throw new ErrorDatabase(`Field ${fieldName} not found in table ${this.name}.`, 'FIELD_NOT_FOUND');
      }

      return field;
   }

   /**
    * Builds the SQL query to create this table in the given schema.
    * @param {string} schemaName - The name of the schema.
    * @returns {string} The SQL CREATE TABLE query.
    * @throws {ErrorDatabase} If schemaName or table name is not set.
    */
   buildCreateTableQuery(schemaName) {
      if (!schemaName || !this.name) {
         throw new ErrorDatabase('Table name and schema name is required to build the "create table" query', 'TABLE_NAME_OR_SCHEMA_NAME_REQUIRED');
      }

      const fieldsDefinition = this.fields.map(field => field.buildDefinitionSQL()).join(', ');
      return `CREATE TABLE IF NOT EXISTS ${schemaName}.${this.name} (${fieldsDefinition});`;
   }
}

module.exports = Table;

const ErrorDatabase = require('./errors/ErrorDatabase');

/**
 * RelatedField represents a foreign key or reference to another table's field in a relational database schema.
 * Used to define relationships between tables (e.g., for JOINs or foreign key constraints).
 *
 * @class RelatedField
 * @param {Object} setup - Configuration object.
 * @param {string} setup.schema - The schema name of the related table.
 * @param {string} setup.table - The table name of the related table.
 * @param {string} setup.field - The field/column name in the related table.
 * @throws {ErrorDatabase} If schema, table, or field is missing.
 */
class RelatedField {
   /**
    * Constructs a RelatedField instance.
    * @param {Object} setup - The setup object.
    * @param {string} setup.schema - The schema name.
    * @param {string} setup.table - The table name.
    * @param {string} setup.field - The field/column name.
    * @throws {ErrorDatabase} If schema, table, or field is missing.
    */
   constructor(setup = {}) {
      const { schema, table, field } = setup;

      if (!schema || !table || !field) {
         throw new ErrorDatabase('Schema name, table name, and field are required to create a RelatedField.', 'RELATED_FIELD_REQUIRED');
      }

      this.schema = schema;
      this.table = table;
      this.field = field;
   }

   /**
    * Returns the full table path in the format 'schema.table'.
    * @returns {string} The full table path.
    */
   get tablePath() {
      return `${this.schema}.${this.table}`;
   }
}

module.exports = RelatedField;

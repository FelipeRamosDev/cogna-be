const ErrorDatabase = require("./errors/ErrorDatabase");
const RelatedField = require("./RelatedField");

/**
 * Field class represents a field in a database model.
 * It initializes with a key, type, and optional properties like notNull, unique, defaultValue, primaryKey, and autoIncrement.
 * Provides a method to generate the SQL definition for the field.
 *
 * @class Field
 * @param {Object} setup - The setup object for the field.
 * @param {string} setup.name - The name of the field.
 * @param {string} setup.type - The data type of the field.
 * @param {*} [setup.defaultValue=null] - The default value for the field.
 * @param {boolean} [setup.notNull=true] - Whether the field can be null.
 * @param {boolean} [setup.unique=false] - Whether the field must be unique.
 * @param {boolean} [setup.primaryKey=false] - Whether the field is a primary key.
 * @param {boolean} [setup.autoIncrement=false] - Whether the field is auto-incrementing.
 * @throws {ErrorDatabase} If name or type is not provided or is not a string.
 */
class Field {
   /**
    * Creates a new Field instance.
    * @param {Object} setup - The setup object for the field.
    */
   constructor(setup = {}) {
      const {
         name,
         type,
         notNull,
         unique,
         primaryKey,
         autoIncrement,
         defaultValue,
         relatedField
      } = setup;

      if (!name || typeof name !== 'string') {
         throw new ErrorDatabase('Field name is required', 'FIELD_NAME_REQUIRED');
      }

      this.name = name;
      this.type = type;
      this.defaultValue = defaultValue;
      this.notNull = Boolean(notNull);
      this.unique = Boolean(unique);
      this.primaryKey = Boolean(primaryKey);
      this.autoIncrement = Boolean(autoIncrement);

      if (relatedField) {
         this.relatedField = new RelatedField(relatedField);
      }
   }

   /**
    * Builds the SQL definition string for this field, including type and constraints.
    * @returns {string} The SQL definition for the field.
    */
   buildDefinitionSQL() {
      const SQLQuery = [];

      if (this.type) {
         SQLQuery.push(this.type);
      }

      if (this.primaryKey) {
         SQLQuery.push('SERIAL PRIMARY KEY');
      }

      if (this.unique) {
         SQLQuery.push('UNIQUE');
      }

      if (this.autoIncrement) {
         SQLQuery.push('AUTOINCREMENT');
      }

      if (this.notNull) {
         SQLQuery.push('NOT NULL');
      }

      if (this.defaultValue !== undefined && this.defaultValue !== null) {
         if (this.defaultValue === 'CURRENT_TIMESTAMP') {
            SQLQuery.push('DEFAULT CURRENT_TIMESTAMP');
         }
         
         else if (typeof this.defaultValue === 'string') {
            SQLQuery.push(`DEFAULT '${this.defaultValue}'`);
         }
         
         else {
            SQLQuery.push(`DEFAULT ${this.defaultValue}`);
         }
      }

      if (this.relatedField) {
         const { tablePath, field } = this.relatedField;
         if (!tablePath || !field) {
            throw new ErrorDatabase('Foreign key must have both tablePath and field defined', 'FOREIGN_KEY_DEFINITION_REQUIRED');
         }

         SQLQuery.push(',');
         SQLQuery.push(`
            CONSTRAINT fk_${this.name}
               FOREIGN KEY (${this.name})
               REFERENCES ${tablePath}(${field})
               ON DELETE SET NULL
         `);
      }

      return `${this.name} ${SQLQuery.join(' ')}`;
   }
}

module.exports = Field;

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
 * @throws {Error} If name or type is not provided or is not a string.
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
      } = setup;

      if (!name || typeof name !== 'string') {
         throw new Error('Field name is required');
      }

      this.name = name;
      this.type = type;
      this.defaultValue = defaultValue;
      this.notNull = Boolean(notNull);
      this.unique = Boolean(unique);
      this.primaryKey = Boolean(primaryKey);
      this.autoIncrement = Boolean(autoIncrement);
   }

   /**
    * Builds the SQL definition string for this field, including type and constraints.
    * @returns {string} The SQL definition for the field.
    */
   buildDefinitionSQL() {
      const constraints = [];

      if (this.type) {
         constraints.push(this.type);
      }

      if (this.primaryKey) {
         constraints.push('SERIAL PRIMARY KEY');
      }

      if (this.unique) {
         constraints.push('UNIQUE');
      }

      if (this.autoIncrement) {
         constraints.push('AUTOINCREMENT');
      }

      if (this.notNull) {
         constraints.push('NOT NULL');
      }

      if (this.defaultValue !== undefined && this.defaultValue !== null) {
         if (this.defaultValue === 'CURRENT_TIMESTAMP') {
            constraints.push('DEFAULT CURRENT_TIMESTAMP');
         }
         
         else if (typeof this.defaultValue === 'string') {
            constraints.push(`DEFAULT '${this.defaultValue}'`);
         }
         
         else {
            constraints.push(`DEFAULT ${this.defaultValue}`);
         }
      }

      return `${this.name} ${constraints.join(' ')}`;
   }
}

module.exports = Field;

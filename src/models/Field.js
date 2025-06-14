/**
 * Field class represents a field in a database model.
 * It initializes with a key, type, and optional properties like allowNull, unique, defaultValue, and autoIncrement.
 *
 * @class Field
 * @param {Object} setup - The setup object for the field.
 * @param {string} setup.key - The name of the field.
 * @param {string} setup.type - The data type of the field.
 * @param {*} [setup.defaultValue=null] - The default value for the field.
 * @param {boolean} [setup.allowNull=true] - Whether the field can be null.
 * @param {boolean} [setup.unique=false] - Whether the field must be unique.
 * @param {boolean} [setup.primaryKey=false] - Whether the field is a primary key.
 * @param {boolean} [setup.autoIncrement=false] - Whether the field is auto-incrementing.
 * @throws {Error} If key or type is not provided or is not a string.
 */
class Field {
   constructor(setup = {}) {
      const {
         key,
         type,
         allowNull,
         unique,
         primaryKey,
         autoIncrement,
         defaultValue = null,
      } = setup;

      if (!key || typeof key !== 'string') {
         throw new Error('Field name is required');
      }

      if (!type || typeof type !== 'string') {
         throw new Error('Field type is required');
      }

      this.key = key;
      this.type = type;
      this.defaultValue = defaultValue;
      this.allowNull = Boolean(allowNull);
      this.unique = Boolean(unique);
      this.primaryKey = Boolean(primaryKey);
      this.autoIncrement = Boolean(autoIncrement);
   }
}

module.exports = Field;

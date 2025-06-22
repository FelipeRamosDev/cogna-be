const SQL = require('./SQL');

/**
 * UpdateSQL is a query builder for UPDATE statements, extending the base SQL builder.
 * Provides a fluent interface for building and executing UPDATE queries with parameterized values.
 *
 * @class UpdateSQL
 * @extends SQL
 * @param {Object} database - The database instance with a pool.query method.
 * @param {string} schemaName - The schema name for the table.
 * @param {string} tableName - The table name.
 */
class UpdateSQL extends SQL {
   /**
    * @constructor
    * @param {Object} database - The database instance with a pool.query method.
    * @param {string} schemaName - The schema name for the table.
    * @param {string} tableName - The table name.
    */
   constructor (database, schemaName, tableName) {
      super(database, schemaName, tableName);
      
      this.updateClause = `UPDATE ${this.tablePath}`;
      this.setClause = '';
      this.isAllowedNullWhere = false;
   }

   /**
    * Builds the SQL UPDATE query string from the current state.
    * Throws if no WHERE clause is set and allowNullWhere is not enabled.
    * @returns {string} The SQL query string.
    * @throws {Error} If no WHERE clause is set and allowNullWhere is not enabled.
    */
   toString() {
      if (!this.whereClause && !this.isAllowedNullWhere) {
         throw this.database.toError('Where clause is required for update queries unless allowNullWhere is set.');
      }
   
      return [
         this.updateClause,
         this.setClause,
         this.whereClause,
         this.returningClause
      ].filter(Boolean).join(' ');
   }

   /**
    * Sets the columns and values to update in the query.
    * @param {Object} dataSet - The data object where keys are column names and values are the new values.
    * @returns {UpdateSQL}
    * @throws {Error} If dataSet is not a non-null object or is empty.
    */
   set(dataSet = {}) {
      if (typeof dataSet !== 'object' || dataSet === null) {
         throw this.database.toError('Data set must be a non-null object.');
      }

      const dataEntries = Object.keys(dataSet);
      if (!dataEntries.length) {
         throw this.database.toError('Data set must contain at least one key-value pair.');
      }

      const parsed = dataEntries.map((key, index) => {
         this.values.push(dataSet[key]);   
         return `${key} = $${this.values.length}`;
      });

      this.setClause = `SET ${parsed.join(', ')}`; 
      return this;
   }
}

/**
 * Exports the UpdateSQL class for use as an UPDATE query builder.
 */
module.exports = UpdateSQL;

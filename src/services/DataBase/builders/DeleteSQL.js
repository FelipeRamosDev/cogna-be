const SQL = require('./SQL');

/**
 * DeleteSQL is a query builder for DELETE statements, extending the base SQL builder.
 * Provides a fluent interface for building and executing DELETE queries with parameterized values.
 *
 * @class DeleteSQL
 * @extends SQL
 * @param {Object} database - The database instance with a pool.query method.
 * @param {string} schemaName - The schema name for the table.
 * @param {string} tableName - The table name.
 */
class DeleteSQL extends SQL {
   /**
    * @constructor
    * @param {Object} database - The database instance with a pool.query method.
    * @param {string} schemaName - The schema name for the table.
    * @param {string} tableName - The table name.
    */
   constructor(database, schemaName, tableName) {
      super(database, schemaName, tableName);

      this.isAllowedNullWhere = false;
   }

   /**
    * Returns the DELETE FROM clause for the query.
    * @returns {string} The DELETE FROM clause.
    */
   get deleteClause() {
      return `DELETE FROM ${this.tablePath}`;
   }

   /**
    * Builds the SQL DELETE query string from the current state.
    * Throws if no WHERE clause is set and allowNullWhere is not enabled.
    * @returns {string} The SQL query string.
    * @throws {Error} If no WHERE clause is set and allowNullWhere is not enabled.
    */
   toString() {
      if (!this.whereClause && !this.isAllowedNullWhere) {
         throw this.database.toError('Where clause is required for delete queries unless allowNullWhere is set.');
      }

      return [
         this.deleteClause,
         this.whereClause,
         this.returningClause
      ].filter(Boolean).join(' ');
   }
}

/**
 * Exports the DeleteSQL class for use as a DELETE query builder.
 */
module.exports = DeleteSQL;

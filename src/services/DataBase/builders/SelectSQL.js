const SQL = require('./SQL');

/**
 * SelectSQL is a query builder for SELECT statements, extending the base SQL builder.
 * Provides a fluent interface for building SELECT queries with sorting, limiting, and field selection.
 *
 * @class SelectSQL
 * @extends SQL
 * @param {Object} database - The database instance with a pool.query method.
 * @param {string} schemaName - The schema name for the table.
 * @param {string} tableName - The table name.
 */
class SelectSQL extends SQL {
   /**
    * @constructor
    * @param {Object} database - The database instance with a pool.query method.
    * @param {string} schemaName - The schema name for the table.
    * @param {string} tableName - The table name.
    */
   constructor(database, schemaName, tableName) {
      super(database, schemaName, tableName);

      this.selectClause = 'SELECT * FROM';
      this.sortClause = '';
   }

   /**
    * Builds the SQL SELECT query string from the current state.
    * @returns {string} The SQL query string.
    */
   toString() {
      const queryParts = [
         this.selectClause,
         this.tablePath,
         this.whereClause,
         this.sortClause,
         this.limitClause
      ];

      return queryParts.filter(Boolean).join(' ');
   }

   /**
    * Sets the fields to select in the query.
    * @param {string[]} [fields=['*']] - The fields to select.
    * @returns {SelectSQL}
    */
   select(fields = ['*']) {
      if (Array.isArray(fields) && fields.length) {
         const validatedFields = fields.map(field => this.charsVerifier(field));  
         this.selectClause = `SELECT ${validatedFields.join(', ')} FROM`;
      } else {
         this.selectClause = 'SELECT * FROM';
      }

      return this;
   }

   /**
    * Adds an ORDER BY clause to the query.
    * @param {Object} sort - An object where keys are field names and values are 'ASC' or 'DESC'.
    * @returns {SelectSQL}
    */
   sort(sort = {}) {
      const allowedOrders = ['ASC', 'DESC'];
      if (typeof sort !== 'object' || Object.keys(sort).length === 0) {
         return this;
      }

      const sortEntries = Object.entries(sort);
      const parsed = sortEntries.map(([key, order]) => {
         const table = this.database.getTable(this.tablePath);
         const field = table && table.getField(key);

         if (!field || !allowedOrders.includes(order.toUpperCase())) {
            return;
         }

         return `${key} ${order.toUpperCase()}`;
      }).filter(Boolean);

      if (parsed.length) {
         this.sortClause = `ORDER BY ${parsed.join(', ')}`;
      }
      return this;
   }
}

/**
 * Exports the SelectSQL class for use as a SELECT query builder.
 */
module.exports = SelectSQL;

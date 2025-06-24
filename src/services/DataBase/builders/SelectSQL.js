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

      this.selectClause = '';
      this.sortClause = '';
   }

   /**
    * Builds the SQL SELECT query string from the current state.
    * @returns {string} The SQL query string.
    */
   toString() {
      if (!this.selectClause) {
         this.selectFields();
      }

      if (!this.fromClause) {
         this.from();
      }

      const queryParts = [
         this.selectClause,
         this.fromClause,
         this.joinClause,
         this.onClause,
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
   selectFields(fields = ['*']) {
      if (Array.isArray(fields) && fields.length) {
         const validatedFields = fields.map(field => {
            if (typeof field === 'string') {
               return this.charsVerifier(field, '*.')
            }

            else if (Array.isArray(field) && field.length === 2) {
               return `${this.charsVerifier(field[0], '.')} AS ${this.charsVerifier(field[1], '.')}`;
            }

            return '';
         });

         this.selectClause = `SELECT ${validatedFields.join(', ')}`;
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

   populate(fieldName, fields) {
      const originAllFields = `${this.tableName}.*`;

      this.selectFields([ originAllFields, ...fields ]);
      this.from([{ path: this.tablePath, alias: this.tableName }]);

      const field = this.database.getField(this.tablePath, fieldName);
      const relatedField = field.relatedField;

      this.join(relatedField.tablePath);
      this.on(`${this.tableName}.${fieldName}`, `${relatedField.table}.${relatedField.field}`);

      return this;  
   }
}

/**
 * Exports the SelectSQL class for use as a SELECT query builder.
 */
module.exports = SelectSQL;

/**
 * QuerySQL is a query builder for SQL databases, designed for use with PostgreSQL.
 * It provides a fluent interface for building and executing SQL queries with parameterized values.
 *
 * @class QuerySQL
 * @param {Object} database - The database instance with a pool.query method.
 * @param {string} [schemaName] - The schema name for the table.
 * @param {string} [tableName] - The table name.
 */
class QuerySQL {
   /**
    * @constructor
    * @param {Object} database - The database instance with a pool.query method.
    * @param {string} [schemaName] - The schema name for the table.
    * @param {string} [tableName] - The table name.
    */
   constructor(database, schemaName = '', tableName = '') {
      if (!database?.pool || typeof database.pool.query !== 'function') {
         throw new Error('A valid database instance with a query method is required.');
      }

      this.database = database;
      this.schemaName = schemaName;
      this.tableName = tableName;

      this.whereClause = '';
      this.limitClause = '';
      this.returningClause = 'RETURNING *';
      this.values = [];
   }

   /**
    * Returns the full table path in the format schema.table, after verifying identifiers.
    * @returns {string}
    * @throws {Error} If schema or table name is not set or invalid.
    */
   get tablePath() {
      if (!this.schemaName || !this.tableName) {
         throw new Error('Schema name and table name must be set before executing the query.');
      }

      return `${this.charsVerifier(this.schemaName)}.${this.charsVerifier(this.tableName)}`;
   }

   /**
    * Verifies that an identifier (schema/table/column) is valid (alphanumeric or underscore).
    * @param {string} identifier
    * @returns {string} The verified identifier.
    * @throws {Error} If the identifier is invalid.
    */
   charsVerifier(identifier) {
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
         throw new Error(`Invalid identifier: ${identifier}`);
      }

      return identifier;
   }

   /**
    * Allows queries without a WHERE clause (use with caution).
    * @returns {QuerySQL}
    */
   allowNullWhere() {
      this.isAllowedNullWhere = true;
      return this;
   }

   /**
    * Sets the schema and table name for the query.
    * @param {string} schemaName
    * @param {string} tableName
    * @returns {QuerySQL}
    * @throws {Error} If schema or table name is not a string.
    */
   from(schemaName, tableName) {
      if (typeof schemaName !== 'string' || typeof tableName !== 'string') {
         throw this.database.toError('Schema name and table name must be strings.');
      }

      this.schemaName = schemaName;
      this.tableName = tableName;
      return this;
   }

   /**
    * Sets the schema name for the query.
    * @param {string} schemaName
    * @returns {QuerySQL}
    * @throws {Error} If schema name is not a string.
    */
   schema(schemaName) {
      if (typeof schemaName !== 'string') {  
         throw this.database.toError('Schema name must be a string.');  
      }

      this.schemaName = schemaName;
      return this;
   }

   /**
    * Sets the table name for the query.
    * @param {string} tableName
    * @returns {QuerySQL}
    * @throws {Error} If table name is not a string.
    */
   table(tableName) {
      if (typeof tableName !== 'string') {  
         throw this.database.toError('Table name must be a string.');  
      }

      this.tableName = tableName;
      return this;
   }

   /**
    * Adds a WHERE clause to the query. Accepts an object (AND) or array (OR) of conditions.
    * @param {Object|Array} conditions - The conditions for the WHERE clause.
    * @returns {QuerySQL}
    */
   where(conditions = {}) {
      let result = '';

      if (Array.isArray(conditions)) {
         // If conditions is an array, we assume it's a list of OR conditions

         result = conditions.map((current) => {
            const [ key ] = Object.keys(current);
            const props = current[key];
            
            if (!Array.isArray(props) && typeof props === 'object') {
               const operator = props.operator || '=';

               this.values.push(props.value);
               return `${key} ${operator} $${this.values.length}`;
            }

            this.values.push(props);
            return `${key} = $${this.values.length}`;
         }).join(' OR ');
      } else if (typeof conditions === 'object') {
         // If conditions is an object, we assume it's a list of AND conditions

         result = Object.entries(conditions).map((current) => {
            const [key, props] = current;

            if (!Array.isArray(props) && typeof props === 'object') {
               const operator = props.operator || '=';

               this.values.push(props.value);
               return `${key} ${operator} $${this.values.length}`;
            }

            this.values.push(props);
            return `${key} = $${this.values.length}`;
         }).join(' AND ');
      }

      if (result) {
         this.whereClause = `WHERE ${result}`;
      } else {
         this.whereClause = '';
      }

      return this;
   }

   /**
    * Adds a LIMIT clause to the query.
    * @param {number} limit - The maximum number of records to return.
    * @returns {QuerySQL}
    * @throws {Error} If limit is not a positive number.
    */
   limit(limit = 10) {
      if (typeof limit !== 'number' || limit <= 0) {
         throw new Error('Limit must be a positive number.');
      }

      this.limitClause = `LIMIT ${limit}`;
      return this;
   }

   /**
    * Adds a RETURNING clause to the query (for INSERT/UPDATE/DELETE).
    * @param {string|string[]} columns - The columns to return.
    * @returns {QuerySQL}
    * @throws {Error} If columns is not a string or array of strings.
    */
   returning(columns = '*') {
      if (typeof columns !== 'string' && !Array.isArray(columns)) {
         throw new Error('Columns must be a string or an array of strings.');
      }

      if (Array.isArray(columns)) {
         columns = columns.join(', ');
      }

      this.returningClause = `RETURNING ${columns}`;
      return this;
   }

   /**
    * Executes the built query using the database pool.
    * @async
    * @returns {Promise<Object>} The result object with success, data, and count, or an error object.
    */
   async exec() {
      try {
         const response = await this.database.pool.query(this.toString(), this.values);

         if (!response || !response.rows) {
            return this.database.toError('No data returned from the database.');
         }

         return {
            success: true,
            data: response.rows || [],
            count: response.rowCount || 0
         }
      } catch (error) {
         let mappedError = error;
         if (error.code === '22P02') {
            mappedError = { ...error, code: 400 }; 
         }
      
         return this.database.toError(mappedError);
      }
   }
}

/**
 * Exports the QuerySQL class for use as a query builder.
 */
module.exports = QuerySQL;

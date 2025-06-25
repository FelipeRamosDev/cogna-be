/**
 * SQL is a query builder for SQL databases, designed for use with PostgreSQL.
 * It provides a fluent interface for building and executing SQL queries with parameterized values.
 *
 * @class SQL
 * @param {Object} database - The database instance with a pool.query method.
 * @param {string} [schemaName] - The schema name for the table.
 * @param {string} [tableName] - The table name.
 */
class SQL {
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
      this.fromClause = ''
      this.limitClause = '';
      this.returningClause = '';
      this.joinClause = '';
      this.onClause = '';
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
   charsVerifier(identifier, ignoreChars = '') {
      if (!new RegExp(`^[a-zA-Z0-9_${ignoreChars}]+$`).test(identifier)) {
         throw new Error(`Invalid identifier: ${identifier}`);
      }

      return identifier;
   }

   /**
    * Verifies that a table path is valid and in the format "schema.table".
    * Each part of the path is checked for valid characters using charsVerifier.
    *
    * @param {string} tablePath - The table path to verify, expected in the format "schema.table".
    * @param {string} [ignoreChars] - Optional string of additional characters to allow in the identifier.
    * @returns {string} The verified table path.
    * @throws {Error} If tablePath is not a non-empty string, not in the correct format, or contains invalid characters.
    */
   tablePathVerifier(tablePath, ignoreChars) {
      if (!tablePath || typeof tablePath !== 'string') {
         throw new Error('Table path must be a non-empty string.');
      }

      const parts = tablePath.split('.');
      if (parts.length !== 2) {
         throw new Error('Table path must be in the format "schema.table".');
      }

      const isValid = parts.every(part => this.charsVerifier(part, ignoreChars));
      if (!isValid) {
         throw new Error(`Invalid table path: ${tablePath}`);
      }

      return `${tablePath}`;
   }

   /**
    * Allows queries without a WHERE clause (use with caution).
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
    */
   allowNullWhere() {
      this.isAllowedNullWhere = true;
      return this;
   }

   /**
    * Sets the FROM clause for the query, supporting one or multiple tables (with optional aliases).
    *
    * Each path can be a string (table path in format 'schema.table') or an object:
    *   { path: 'schema.table', alias: 't' }
    *
    * Multiple tables will be separated by commas (producing a cartesian product, not a JOIN).
    * For JOINs, use the join() method.
    *
    * @param {Array<{ path: string, alias?: string }>|string[]} [paths=[{ path: this.tablePath, alias: '' }]]
    *   Array of table paths (with optional aliases) or strings in 'schema.table' format.
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL} The query builder instance for chaining.
    * @throws {Error} If any table path or alias is invalid.
    */
   from(paths = [{ path: this.tablePath, alias: '' }]) {
      const parsePaths = paths.map((item) => {
         if (typeof item === 'string') {
            return this.charsVerifier(item);
         }

         if (typeof item === 'object' && !Array.isArray(item) && item.path) {
            return item.alias ? `${item.path} AS ${this.charsVerifier(item.alias)}` : item.path;
         }
      }).join(', ');

      this.fromClause = `FROM ${parsePaths}`;
      return this;
   }

   /**
    * Adds a JOIN clause to the query.
    *
    * @param {string} tablePath - The table path to join, in the format "schema.table".
    * @param {string} [joinType='LEFT'] - The type of join to perform. Must be one of: 'LEFT', 'RIGHT', 'INNER', 'OUTER'.
    * @param {string} [alias=''] - Optional alias for the joined table. If not provided, the table name will be used as the alias.
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL} The query builder instance for chaining.
    * @throws {Error} If tablePath is not a non-empty string.
    * @throws {Error} If FROM clause is not set before adding JOIN.
    * @throws {Error} If joinType is not one of the allowed values.
    */
   join(tablePath, joinType = 'LEFT', alias = '') {
      if (!tablePath || typeof tablePath !== 'string') {
         throw new Error('Table path must be a non-empty string.');
      }

      const verifiedPath = this.tablePathVerifier(tablePath);
      if (!this.fromClause) {
         throw new Error('FROM clause must be set before adding JOIN clauses.');
      }

      if (!['LEFT', 'RIGHT', 'INNER', 'OUTER'].includes(joinType.toUpperCase())) {
         throw new Error('Join type must be one of: LEFT, RIGHT, INNER, OUTER.');
      }

      const splitTablePath = tablePath.split('.');
      if (!alias && splitTablePath.length === 2) {
         alias = splitTablePath[1];
      }

      const joinClause = alias ? `${verifiedPath} AS ${this.charsVerifier(alias)}` : verifiedPath;
      this.joinClause = `${joinType.toUpperCase()} JOIN ${joinClause}`;
      return this;
   }

   /**
    * Adds an ON clause to the query for joining tables.
    *
    * @param {string} fieldOut - The field from the outer (joined) table, e.g., "table1.id".
    * @param {string} fieldIn - The field from the inner (base) table, e.g., "table2.foreign_id".
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL} The query builder instance for chaining.
    * @throws {Error} If either fieldOut or fieldIn is not provided.
    */
   on(fieldOut, fieldIn) {
      if (!fieldOut || !fieldIn) {
         throw new Error('Both fields for ON clause must be provided.');
      }

      this.onClause = `ON ${fieldOut} = ${fieldIn}`;
      return this;
   }

   /**
    * Sets the schema name for the query.
    * @param {string} schemaName
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
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
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
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
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
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
      } else if (typeof conditions === 'object' && conditions !== null) {
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
      } else {
         // If conditions is not an object or array, we throw an error
         throw this.database.toError({ code: 400, message: 'Conditions must be an object or an array.' });
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
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
    * @throws {Error} If limit is not a positive number.
    */
   limit(limit = 10) {
      if (typeof limit !== 'number' || limit <= 0) {
         throw this.database.toError({ code: 400, message: 'Limit must be a positive number.' });
      }

      this.limitClause = `LIMIT ${limit}`;
      return this;
   }

   /**
    * Adds a RETURNING clause to the query (for INSERT/UPDATE/DELETE).
    * @param {string|string[]} columns - The columns to return.
    * @returns {InsertSQL|SelectSQL|UpdateSQL|DeleteSQL}
    * @throws {Error} If columns is not a string or array of strings.
    */
   returning(columns = ['*']) {
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
         } else if (error.code === '23505') {
            mappedError = { ...error, code: 409 }; 
         } else if (error.code === '23503') {
            mappedError = { ...error, code: 404 }; 
         } else if (error.code === '42601') {
            mappedError = { ...error, code: 400 }; 
         } else if (error.code === '3D000') {
            mappedError = { ...error, code: 404 }; 
         }

         return this.database.toError(mappedError);
      }
   }

   /**
    * Executes a raw SQL query with the provided arguments.
    * 
    * @param  {...any} args 
    * @returns 
    */
   query(...args) {
      return this.database.pool.query(...args);
   }
}

/**
 * Exports the SQL class for use as a query builder.
 */
module.exports = SQL;

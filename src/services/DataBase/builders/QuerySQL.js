class QuerySQL {
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

   get tablePath() {
      if (!this.schemaName || !this.tableName) {
         throw new Error('Schema name and table name must be set before executing the query.');
      }

      return `${this.charsVerifier(this.schemaName)}.${this.charsVerifier(this.tableName)}`;
   }

   charsVerifier(identifier) {
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
         throw new Error(`Invalid identifier: ${identifier}`);
      }

      return identifier;
   }

   allowNullWhere() {
      this.isAllowedNullWhere = true;
      return this;
   }

   from(schemaName, tableName) {
      if (typeof schemaName !== 'string' || typeof tableName !== 'string') {
         throw this.database.toError('Schema name and table name must be strings.');
      }

      this.schemaName = schemaName;
      this.tableName = tableName;
      return this;
   }

   schema(schemaName) {
      if (typeof schemaName !== 'string') {  
         throw this.database.toError('Schema name must be a string.');  
      }

      this.schemaName = schemaName;
      return this;
   }

   table(tableName) {
      if (typeof tableName !== 'string') {  
         throw this.database.toError('Table name must be a string.');  
      }

      this.tableName = tableName;
      return this;
   }

   where(conditions = {}) {
      let result = '';

      if (Array.isArray(conditions)) {
         // If conditions is an array, we assume it's a list of OR conditions

         result = conditions.map((current, idx) => {
            const [ key ] = Object.keys(current);
            const props = current[key];
            const index = this.values.length + 1;
            
            if (!Array.isArray(props) && typeof props === 'object') {
               const operator = props.operator || '=';

               this.values.push(props.value);
               return `${key} ${operator} $${index}`;
            }

            this.values.push(props);
            return `${key} = $${index}`;
         }).join(' OR ');
      } else if (typeof conditions === 'object') {
         // If conditions is an object, we assume it's a list of AND conditions

         result = Object.entries(conditions).map((current, idx) => {
            const [key, props] = current;
            const index = this.values.length + 1;

            if (!Array.isArray(props) && typeof props === 'object') {
               const operator = props.operator || '=';

               this.values.push(props.value);
               return `${key} ${operator} $${index}`;
            }

            this.values.push(props);
            return `${key} = $${index}`;
         }).join(' AND ');
      }

      if (result) {
         this.whereClause = `WHERE ${result}`;
      } else {
         this.whereClause = '';
      }

      return this;
   }

   limit(limit = 10) {
      if (typeof limit !== 'number' || limit <= 0) {
         throw new Error('Limit must be a positive number.');
      }

      this.limitClause = `LIMIT ${limit}`;
      return this;
   }

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

   async exec() {
      try {
         const response = await this.database.pool.query(this.toString(), this.values);

         return {
            success: true,
            data: response.rows || [],
            count: response.rowCount || 0
         }
      } catch (error) {
         const errorData = this.database.toError('Error reading records from database: ' + error.message);
         return errorData;
      }
   }
}

module.exports = QuerySQL;

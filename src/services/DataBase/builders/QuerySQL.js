class QuerySQL {
   constructor(database, schemaName = '', tableName = '') {
      if (!database || typeof database.pool.query !== 'function') {
         throw new Error('A valid database instance with a query method is required.');
      }

      this.database = database;
      this.schemaName = schemaName;
      this.tableName = tableName;

      this.selectClause = 'SELECT * FROM';
      this.whereClause = '';
      this.sortClause = '';
      this.limitClause = '';
      this.values = [];
   }

   get tablePath() {
      if (!this.schemaName || !this.tableName) {
         throw new Error('Schema name and table name must be set before executing the query.');
      }

      return `${this.quoteIdentifier(this.schemaName)}.${this.quoteIdentifier(this.tableName)}`;
   }

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

   quoteIdentifier(identifier) {
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
         throw new Error(`Invalid identifier: ${identifier}`);
      }

      return `${identifier}`;
   }

   select(fields = ['*']) {
      if (Array.isArray(fields) && fields.length) {
         this.selectClause = `SELECT ${fields.join(', ')} FROM`;
      } else {
         this.selectClause = 'SELECT * FROM';
      }

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
      this.schemaName = schemaName;
      return this;
   }

   table(tableName) {
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

      this.whereClause = `WHERE ${result}`;
      return this;
   }

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

      this.sortClause = `ORDER BY ${parsed.join(', ')}`;
      return this;
   }

   limit(limit = 10) {
      if (typeof limit !== 'number' || limit <= 0) {
         throw new Error('Limit must be a positive number.');
      }

      this.limitClause = `LIMIT ${limit}`;
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
         return this.database.toError('Error reading records from database: ' + error.message);
      }
   }
}

module.exports = QuerySQL;

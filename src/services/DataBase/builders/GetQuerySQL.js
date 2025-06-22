const QuerySQL = require('./QuerySQL');

class GetQuerySQL extends QuerySQL {
   constructor(database, schemaName, tableName) {
      super(database, schemaName, tableName);

      this.selectClause = 'SELECT * FROM';
      this.sortClause = '';
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

   select(fields = ['*']) {
      if (Array.isArray(fields) && fields.length) {
         const validatedFields = fields.map(field => this.charsVerifier(field));  
         this.selectClause = `SELECT ${validatedFields.join(', ')} FROM`;
      } else {
         this.selectClause = 'SELECT * FROM';
      }

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

      if (parsed.length) {
         this.sortClause = `ORDER BY ${parsed.join(', ')}`;
      }
      return this;
   }
}

module.exports = GetQuerySQL;

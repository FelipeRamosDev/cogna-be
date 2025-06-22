const SQL = require('./SQL');

class InsertSQL extends SQL {
   constructor(database, schemaName, tableName) {
      super(database, schemaName, tableName);
      
      this.insertClause = '';
   }

   toString() {
      return [
         this.insertClause,
         this.returningClause
      ].filter(Boolean).join(' ');
   }

   data(data) {
      if (typeof data !== 'object' || data === null) {
         throw new Error('Data must be an object');
      }

      const insertClause = [ 'INSERT INTO', this.tablePath ];
      const keys = Object.keys(data);

      this.values = Object.values(data);
      const placeholders = this.values.map((_, index) => `$${index + 1}`).join(', ')

      insertClause.push('(');
      insertClause.push(keys.join(', '));
      insertClause.push(')');

      insertClause.push('VALUES');
      insertClause.push('(');
      insertClause.push(placeholders);
      insertClause.push(')');

      this.insertClause = insertClause.join(' ');
      return this;
   }
}

module.exports = InsertSQL;

const QuerySQL = require('./QuerySQL');

class UpdateQuerySQL extends QuerySQL {
   constructor (database, schemaName, tableName) {
      super(database, schemaName, tableName);
      
      this.updateClause = `UPDATE ${this.tablePath}`;
      this.setClause = '';
      this.isAllowedNullWhere = false;
   }

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

   set(dataSet = {}) {
      const dataEntries = Object.keys(dataSet);

      if (typeof dataSet !== 'object' || dataSet === null || !dataEntries.length) {
         throw this.database.toError('Data set must be a non-null object.');
      }

      const parsed = dataEntries.map((key, index) => {
         this.values.push(dataSet[key]);   
         return `${key} = $${index + 1}`
      });

      this.setClause = `SET ${parsed.join(', ')}`; 
      return this;
   }
}

module.exports = UpdateQuerySQL;

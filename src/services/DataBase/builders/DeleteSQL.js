const SQL = require('./SQL');

class DeleteSQL extends SQL {
   constructor(database, schemaName, tableName) {
      super(database, schemaName, tableName);

      this.isAllowedNullWhere = false;
   }

   get deleteClause() {
      return `DELETE FROM ${this.tablePath}`;
   }

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

module.exports = DeleteSQL;

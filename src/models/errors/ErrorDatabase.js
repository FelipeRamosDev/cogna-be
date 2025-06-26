class ErrorDatabase extends Error {
   constructor(message = 'Unknown database error!', code = 'DATABASE_ERROR', data) {
      super(message);

      this.error = true;
      this.code = code;
      this.name = '[Database]';
      this.data = data || null;
   }
}

module.exports = ErrorDatabase;

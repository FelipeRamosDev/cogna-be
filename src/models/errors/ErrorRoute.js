class ErrorRoute extends Error {
   constructor(message = 'Unknown error on route!', code = 'ROUTE_ERROR', data) {
      super(message);

      this.name = '[Route]';
      this.error = true;
      this.code = code;
      this.data = data || null;
   }
}

module.exports = ErrorRoute;

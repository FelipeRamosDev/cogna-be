class ErrorRoute extends Error {
   constructor(message = 'Unkown error on route!', code = 'ROUTE_ERROR', data) {
      super(message);

      this.name = '[Route]';
      this.code = code;
      this.data = data || null;
   }
}

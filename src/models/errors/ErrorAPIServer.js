class ErrorAPIServer extends Error {
   constructor(message = 'Unknown API server error!', code = 'API_SERVER_ERROR', data) {
      super(message);

      this.error = true;
      this.code = code;
      this.name = '[APIServer]';
      this.data = data || null;
   }
}

module.exports = ErrorAPIServer;

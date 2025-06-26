class ErrorRequestHTTP extends Error {
   constructor(message = 'Internal server error!', status = 500, code = 'REQUEST_HTTP_ERROR') {
      super(message);

      this.error = true;
      this.code = code;
      this.status = status;

      this.name = '[RequestHTTP]';
   }

   send(res) {
      if (!res || typeof res.status !== 'function' || typeof res.send !== 'function') {
         throw new Error('Invalid response object provided to ErrorRequestHTTP.send');
      }

      return res.status(this.status).send({
         error: this.error,
         code: this.code,
         message: this.message
      });
   }
}

module.exports = ErrorRequestHTTP;

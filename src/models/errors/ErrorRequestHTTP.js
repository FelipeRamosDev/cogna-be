class ErrorRequestHTTP extends Error {
   constructor(message = 'Internal server error!', status = 500, code = 'REQUEST_HTTP_ERROR') {
      super(message);

      this.error = true;
      this.code = code;
      this.status = status;

      this.name = '[RequestHTTP]';
   }

   send(res) {
      return res.status(this.status).send({
         error: this.error,
         code: this.code,
         message: this.message
      });
   }
}

module.exports = ErrorRequestHTTP;

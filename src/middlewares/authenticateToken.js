const jwt = require('jsonwebtoken');
const ErrorRequestHTTP = require('../models/errors/ErrorRequestHTTP');

function authenticateToken(req, res, next) {
   const authHeader = req.cookies?.token;

   if (!authHeader) {
      return new ErrorRequestHTTP('No token provided', 401, 'MISSING_TOKEN').send(res);
   }

   jwt.verify(authHeader, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
         return new ErrorRequestHTTP('Invalid token', 401, 'INVALID_TOKEN').send(res);
      }

      if (decoded.exp < (Date.now() / 1000)) {
         return new ErrorRequestHTTP('Token has expired', 401, 'EXPIRED_TOKEN').send(res);
      }

      if (decoded.id !== req.session.user?.id) {
         return new ErrorRequestHTTP('User ID does not match the token', 403, 'FORBIDDEN').send(res);
      }

      next();
   });
};

module.exports = authenticateToken;

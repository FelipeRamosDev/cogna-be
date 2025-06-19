const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
   const authHeader = req.cookies?.token;

   if (!authHeader) {
      return res.status(401).send({ name: 'MISSING_TOKEN', message: 'Any token provided.' });
   }

   jwt.verify(authHeader, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
         return res.status(401).send({ name: 'INVALID_TOKEN', message: 'Invalid token.' });
      }

      if (decoded.exp < (Date.now() / 1000)) {
         return res.status(401).send({ name: 'EXPIRED_TOKEN', message: 'Token has expired.' });
      }

      if (decoded.id !== req.session.user?.id) {
         return res.status(403).send({ name: 'FORBIDDEN', message: 'User ID does not match the token.' });
      }

      next();
   });
};

module.exports = authenticateToken;

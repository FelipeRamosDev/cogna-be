const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
   const authHeader = req.cookies?.token;

   if (!authHeader) {
      return res.status(401).send({ message: 'Any token provided.' });
   }

   jwt.verify(authHeader, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
         return res.status(401).send({ message: 'Invalid or expired token.' });
      }

      if (decoded.exp < Date.now() / 1000) {
         return res.status(401).send({ message: 'Token has expired.' });
      }

      if (decoded.id !== req.session.user?.id) {
         return res.status(403).send({ message: 'User ID does not match the token.' });
      }

      return next();
   });
};

module.exports = authenticateToken;

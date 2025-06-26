const Route = require('../../services/Route');

module.exports = new Route({
   path: '/produto/delete',
   method: 'POST',
   authProtected: true,
   middlewares: [
      function validateProductAuthor(req, res, next) {
         const userID = req.session.user.id;
         const { authorID } = req.body;

         if (authorID !== userID) {
            return res.status(403).send({ error: true, message: 'You are not authorized to delete this product.' });
         }

         next();
      }
   ],
});

const Route = require('../../services/Route');

module.exports = new Route({
   path: '/produto/editar',
   method: 'POST',
   authProtected: true,
   middlewares: [
      function validateProductAuthor(req, res, next) {
         const userID = req.session.user.id;
         const authorID = req.body.data.author_id;

         if (userID !== authorID) {
            return res.status(403).send({ error: true, message: 'You are not authorized to edit this product.' });
         }

         next();
      }
   ]
});

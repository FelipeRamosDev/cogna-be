const Route = require('../../services/Route');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = new Route({
   method: 'POST',
   path: '/produto/importar',
   middlewares: [
      upload.single('file')
   ]
});

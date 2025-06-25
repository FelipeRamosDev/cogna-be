const fs = require('fs');
const ErrorRequestHTTP = require('../../models/errors/ErrorRequestHTTP');

module.exports = function (req, res) {
   const db = this.getDataBase();
   const userID = req.session.user.id;

   if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
   }

   fs.readFile(req.file.path, 'utf8', async (err, data) => {
      if (err) {
         return new ErrorRequestHTTP('Error reading file', 404, 'FILE_READ_ERROR').send(res);
      }

      try {
         const products = JSON.parse(data);

         for (const product of products) {
            product.author_id = userID;

            const imported = await db.insert('products_schema', 'products').data(product).exec();
            if (imported.error) {
               return new ErrorRequestHTTP('Error importing product', 400, 'PRODUCT_IMPORT_ERROR').send(res);
            }
         }

         res.status(201).send({ success: true, products });
      } catch (error) {
         console.error(error);
         return new ErrorRequestHTTP().send(res);
      } finally {
         fs.unlink(req.file.path, () => { });
      }
   });
}
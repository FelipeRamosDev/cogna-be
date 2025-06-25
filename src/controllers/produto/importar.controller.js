const fs = require('fs');

module.exports = function (req, res) {
   const db = this.getDataBase();
   const userID = req.session.user.id;

   if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
   }

   fs.readFile(req.file.path, 'utf8', async (err, data) => {
      if (err) {
         return res.status(500).send({ error: 'Error reading file' });
      }

      try {
         const products = JSON.parse(data);

         for (const product of products) {
            product.author_id = userID;

            const imported = await db.insert('products_schema', 'products').data(product).exec();
            if (imported.error) {
               console.log('Error importing product:', imported);
               return res.status(imported.code || 500).send(imported);
            }
         }

         res.status(201).send({ success: true, products });
      } catch (error) {
         res.status(400).send({ error: 'Invalid JSON file', data: error });
      } finally {
         fs.unlink(req.file.path, () => { });
      }
   });
}
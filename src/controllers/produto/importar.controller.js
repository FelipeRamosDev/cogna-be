const fs = require('fs');

module.exports = function (req, res) {
   if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
   }

   fs.readFile(req.file.path, 'utf8', async (err, data) => {
      if (err) {
         return res.status(500).json({ error: 'Error reading file' });
      }

      try {
         const products = JSON.parse(data);
         const db = this.getDataBase();

         for (const product of products) {
            await db.create('products_schema.products', product);
         }

         res.status(201).send({ success: true, products });
      } catch (e) {
         res.status(400).json({ error: 'Invalid JSON file' });
      } finally {
         fs.unlink(req.file.path, () => { });
      }
   });
}
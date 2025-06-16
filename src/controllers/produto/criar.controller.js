module.exports = async function(req, res) {
   const db = this.getDataBase();
   const productData = req.body;

   if (!productData || Object.keys(productData).length === 0) {
      return res.status(400).send({ error: 'Product data is required.' });
   }

   try {
      const newProduct = await db.create('products_schema.products', productData);
      if (newProduct.error) {
         return res.status(newProduct.code || 500).send(newProduct);
      }

      res.status(201).send({ success: true, created: newProduct });
   } catch (error) {
      res.status(error.code || 500).send(error);
   }
}

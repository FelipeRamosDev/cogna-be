module.exports = async function(req, res) {
   const db = this.getDataBase();
   const productData = req.body;

   try {
      const newProduct = await db.create('products_schema.products', productData);

      if (newProduct.error) {
         return res.status(newProduct.code).send(newProduct);
      }

      res.status(201).send(newProduct);
   } catch (error) {
      res.status(error.code).send(error);
   }
}

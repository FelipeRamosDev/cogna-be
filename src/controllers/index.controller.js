module.exports = async function(req, res) {
   const db = this.getDataBase();

   const products = await db.read('products_schema.products', {});
   if (!products) {
      res.status(404).send({ error: true, message: 'No products found!' });
      return;
   }

   res.status(200).send({
      success: true,
      products: products
   });
}

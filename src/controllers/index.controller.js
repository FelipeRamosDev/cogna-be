module.exports = async function(req, res) {
   const db = this.getDataBase();

   const products = await db.read('products_schema.products', {}, { created_at: 'DESC' });
   if (!products) {
      res.status(404).send({ error: true, message: 'Error on products reading on database!' });
      return;
   }

   res.status(200).send({
      success: true,
      products: products
   });
}

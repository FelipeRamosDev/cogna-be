module.exports = async function (req, res) {
   const db = this.getDataBase();

   const productID = Number(req.params.id);
   if (!productID || productID === 'undefined' || productID === 'null') {
      res.status(400).send({ error: true, message: 'Product ID parameter is required.' });
      return;
   }

   try {
      const { data } = await db.select('products_schema', 'products').where({ id: productID }).exec();
      const products = data;
      if (!products.length) {
         res.status(404).send({ error: true, message: 'Product not found.' });
         return;
      }
   
      res.status(200).send({
         success: true,
         product: products[0]
      });
   } catch (error) {
      res.status(error.code || 500).send({ error: true, message: 'Internal Server Error' });
   }
}

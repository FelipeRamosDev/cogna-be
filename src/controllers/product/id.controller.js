const DUMMY_PRODUCTS = require('../../resources/dummy_products.json');

module.exports = (req, res) => {
   if (!DUMMY_PRODUCTS) {
      res.status(404).send({ error: true, message: 'Products resource not found!' });
      return;
   }

   const productID = Number(req.params.id);
   if (!productID || productID === 'undefined' || productID === 'null') {
      res.status(400).send({ error: true, message: 'Product ID parameter is required.' });
      return;
   }

   const product = DUMMY_PRODUCTS.find(product => product.id === productID);
   if (!product) {
      res.status(404).send({ error: true, message: 'Product not found.' });
      return;
   }

   res.status(200).send({
      success: true,
      product
   });
}

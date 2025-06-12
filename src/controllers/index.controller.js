const DUMMY_PRODUCTS = require('../resources/dummy_products.json');

module.exports = (req, res) => {
   if (!DUMMY_PRODUCTS) {
      res.status(404).send({ error: true, message: 'Products resource not found!' });
      return;
   }

   res.status(200).send({
      success: true,
      products: DUMMY_PRODUCTS
   });
}

const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function (req, res) {
   const db = this.getDataBase();

   const productID = Number(req.params.id);
   if (!productID || productID === 'undefined' || productID === 'null') {
      return new ErrorRequestHTTP('Product ID parameter is required.', 400, 'PRODUCT_ID_REQUIRED').send(res);
   }

   try {
      const { data } = await db.select('products_schema', 'products').where({ id: productID }).exec();
      const products = data;
      if (!products.length) {
         return new ErrorRequestHTTP('Product not found.', 404, 'PRODUCT_NOT_FOUND').send(res);
      }
   
      res.status(200).send({
         success: true,
         product: products[0]
      });
   } catch (error) {
      return new ErrorRequestHTTP().send(res);
   }
}

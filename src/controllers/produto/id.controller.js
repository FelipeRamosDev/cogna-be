const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function (req, res) {
   const db = this.getDataBase();

   const productID = Number(req.params.id);
   if (!productID || productID === 'undefined' || productID === 'null') {
      return new ErrorRequestHTTP('Product ID parameter is required.', 400, 'PRODUCT_ID_REQUIRED').send(res);
   }

   try {
      const productQuery = db.select('products_schema', 'products');

      productQuery.where({ 'products.id': productID });
      productQuery.limit(1);
      productQuery.populate('author_id', [
         ['users.first_name', 'author_first_name'],
         ['users.last_name', 'author_last_name'],
         ['users.email', 'author_email'],
      ]);

      const { data = [] } = await productQuery.exec();
      const [ product ] = data;
      if (!product) {
         return new ErrorRequestHTTP('Product not found.', 404, 'PRODUCT_NOT_FOUND').send(res);
      }
   
      res.status(200).send({
         success: true,
         product: product
      });
   } catch (error) {
      return new ErrorRequestHTTP().send(res);
   }
}

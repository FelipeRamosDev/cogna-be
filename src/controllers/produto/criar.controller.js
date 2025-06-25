const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function(req, res) {
   const db = this.getDataBase();
   const productData = req.body;

   if (!productData || !Object.keys(productData).length) {
      return new ErrorRequestHTTP('Product data is required.', 400, 'PRODUCT_DATA_REQUIRED').send(res);
   }

   try {
      const newProduct = await db.insert('products_schema', 'products').data(productData).exec();
      if (newProduct.error) {
         return new ErrorRequestHTTP('Error creating product', 400, 'PRODUCT_CREATION_ERROR').send(res);
      }

      res.status(201).send({ success: true, created: newProduct });
   } catch (error) {
      console.error(error);
      return new ErrorRequestHTTP().send(res);
   }
}

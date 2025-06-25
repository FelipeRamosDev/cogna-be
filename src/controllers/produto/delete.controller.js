const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function (req, res) {
   const DB = this.getDataBase();
   const productID = req.body.productID;

   try {
      const deleted = await DB.delete('products_schema', 'products').where({ id: productID }).exec();
      if (deleted.error) {
         return new ErrorRequestHTTP('Error deleting product', 400, 'PRODUCT_DELETION_ERROR').send(res);
      }

      res.status(200).send({ success: true });
   } catch (error) {
      console.error(error);
      return new ErrorRequestHTTP().send(res);
   }
}

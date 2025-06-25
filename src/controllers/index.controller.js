const ErrorRequestHTTP = require("../models/errors/ErrorRequestHTTP");

module.exports = async function(req, res) {
   const db = this.getDataBase();
   const api = this.getAPI();

   try {
      const { success, data } = await db.select('products_schema', 'products').sort({ created_at: 'DESC' }).exec();
      const products = data;
      if (!success) {
         return new ErrorRequestHTTP('Error on products reading on database!', 404, 'PRODUCTS_READING_ERROR').send(res);
      }
   
      res.status(200).send({
         success: true,
         products: products || []
      });
   } catch (error) {
      return new ErrorRequestHTTP().send(res);
   }
}

const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const api = this.getAPI();
   const { id, data } = req.body;

   if (!id || !data) {
      return new ErrorRequestHTTP('ID and data are required for updating a product.', 400, 'PRODUCT_UPDATE_ERROR').send(res);
   }

   try {
      const dbQuery = DB.update('products_schema', 'products').where({ id }).set(data);
      const updated = await dbQuery.exec();

      if (updated.error || !updated.success) {
         throw updated;
      }

      res.status(200).send({ success: true });
   } catch (error) {
      return new ErrorRequestHTTP().send(res);
   }
}
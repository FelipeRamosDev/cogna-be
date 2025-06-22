module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const api = this.getAPI();
   const { id, data } = req.body;

   if (!id || !data) {
      const errorData = api.toError({ code: 400, message: 'ID and data are required for updating a product.' });
      return res.status(400).send(errorData);
   }

   try {
      const dbQuery = DB.update('products_schema', 'products').where({ id }).set(data);
      const updated = await dbQuery.exec();

      if (updated.error || !updated.success) {
         throw updated;
      }

      res.status(201).send({ success: true });
   } catch (error) {
      console.error('Error updating product:', error);
      const errorData = api.toError('Internal Server Error');

      res.status(500).send(errorData);
   }
}
module.exports = async function(req, res) {
   const db = this.getDataBase();
   const api = this.getAPI();

   try {
      const { success, data } = await db.query('products_schema', 'products').sort({ created_at: 'DESC' }).exec();
      const products = data;
      if (!success) {
         res.status(404).send(api.toError('Error on products reading on database!'));
         return;
      }
   
      res.status(200).send({
         success: true,
         products: products || []
      });
   } catch (error) {
      res.status(500).send(api.toError('Internal server error'));
   }
}

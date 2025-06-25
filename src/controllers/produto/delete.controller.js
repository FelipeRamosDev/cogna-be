module.exports = async function (req, res) {
   const DB = this.getDataBase();
   const API = this.getAPI();
   const productID = req.body.productID;

   try {
      const deleted = await DB.delete('products_schema', 'products').where({ id: productID }).exec();
      if (deleted.error) {
         console.error('Error deleting product:', deleted);
         return res.status(400).send(API.toError(deleted));
      }

      res.status(200).send({ success: true });
   } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).send(API.toError('Internal server error'));
   }
}

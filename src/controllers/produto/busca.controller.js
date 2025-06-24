module.exports = async function (req, res) {
   const DB = this.getDataBase();
   const API = this.getAPI();
   const { selectFields, where, sort, limit, populateAuthor } = req.body;

   try {
      const query = DB.select('products_schema', 'products').where(where);

      if (selectFields) {
         query.selectFields(selectFields);
      }

      if (sort) {
         query.sort(sort);
      }

      if (limit) {
         query.limit(limit);
      }

      if (populateAuthor) {
         query.populate('author_id', [
            ['users.first_name', 'author_first_name'],
            ['users.last_name', 'author_last_name'],
            ['users.email', 'author_email'],
         ]);
      }

      const { data = [], error } = await query.exec();

      if (error) {
         const errorData = API.toError('An error occurred while fetching products.');
         return res.status(500).json(errorData);
      }

      res.status(200).send({
         success: true,
         products: data
      });
   } catch (error) {
      const errorData = API.toError('An error occurred while processing your request.');
      return res.status(500).send(errorData);
   }
}

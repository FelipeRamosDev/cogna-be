const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async function (req, res) {
   const DB = this.getDataBase();
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
         console.error(error.message);
         return new ErrorRequestHTTP('An error occurred while fetching products.', 400, 'DB_ERROR').send(res);
      }

      res.status(200).send({
         success: true,
         products: data
      });
   } catch (error) {
      console.error(error);
      return new ErrorRequestHTTP().send(res);
   }
}

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const api = this.getAPI();
   const { email, password } = req.body;

   if (!email || !password) {
      const error = api.toError({ status: 400, code: 'REQUIRED_PARAMS', message: 'Email and password are required!' });
      return res.status(error.status).send(error);
   }

   try {
      const { data } = await DB.query('users_schema', 'users').where({ email }).exec();
      const [ user ] = data; // Assuming the query returns an array of users
      if (!user) {
         const error = api.toError({ status: 400, code: 'INVALID_PARAM', message: 'Invalid email!' });
         return res.status(error.status).send(error);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         const error = api.toError({ status: 400, code: 'PASSWORD_MISMATCH', message: 'Invalid password!' });
         return res.status(error.status).send(error);
      }

      req.session.user = {
         id: user.id,
         email: user.email,
         name: user.first_name + ' ' + user.last_name,
      };

      const token = jwt.sign(req.session.user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '24h' });
      res.cookie('token', token, { httpOnly: true, secure: false });

      res.status(200).send({ success: true, user });
   } catch (error) {
         console.error(error)
      res.status(500).send(api.toError());
   }
}

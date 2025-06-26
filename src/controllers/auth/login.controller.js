const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorRequestHTTP = require('../../models/errors/ErrorRequestHTTP');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const { email, password } = req.body;

   if (!email || !password) {
      return new ErrorRequestHTTP('Email and password are required!', 400, 'REQUIRED_PARAMS').send(res);
   }

   try {
      const { data } = await DB.select('users_schema', 'users').where({ email }).exec();
      const [ user ] = data; // Assuming the query returns an array of users
      if (!user) {
         return new ErrorRequestHTTP('User not found!', 404, 'USER_NOT_FOUND').send(res);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         return new ErrorRequestHTTP('Invalid password!', 400, 'PASSWORD_MISMATCH').send(res);
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
      return new ErrorRequestHTTP().send(res);
   }
}

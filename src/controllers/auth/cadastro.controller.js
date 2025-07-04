const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorRequestHTTP = require('../../models/errors/ErrorRequestHTTP');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const { firstName, lastName, email, password, confirmPassword } = req.body;

   if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return new ErrorRequestHTTP('All fields are required.', 400, 'REQUIRED_PARAMS').send(res);
   }

   if (password !== confirmPassword) {
      return new ErrorRequestHTTP('Passwords do not match.', 400, 'PASSWORD_MISMATCH').send(res);
   }

   try {
      const { data } = await DB.select('users_schema', 'users').where({ email }).exec();
      const userExists = data;
      if (userExists.length) {
         return new ErrorRequestHTTP('Email already exists.', 400, 'EMAIL_EXISTS').send(res);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await DB.insert('users_schema', 'users').data({
         first_name: firstName,
         last_name: lastName,
         email: email,
         password: hashedPassword
      }).returning(['id', 'email', 'first_name', 'last_name']).exec();

      if (user.error) {
         return new ErrorRequestHTTP('Error registering user.', 400, 'DB_ERROR').send(res);
      }

      if (!user.data || !Array.isArray(user.data) || user.data.length === 0) {
         return new ErrorRequestHTTP('Error retrieving user data.', 400, 'USER_DATA_ERROR').send(res);
      }

      const [ newUser ] = user.data;
      req.session.user = {
         id: newUser.id,
         email: newUser.email,
         name: `${newUser.first_name} ${newUser.last_name}`,
      };

      const token = jwt.sign(req.session.user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '24h' });
      res.cookie('token', token, { httpOnly: true, secure: false });

      res.status(201).send({ success: true, message: 'User registered successfully.', user: req.session.user });
   } catch (error) {
      return new ErrorRequestHTTP().send(res);
   }  
}

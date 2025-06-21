const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const API = this.getAPI();
   const { firstName, lastName, email, password, confirmPassword } = req.body;

   if (!firstName || !lastName || !email || !password || !confirmPassword) {
      const error = API.toError({ status: 400, code: 'REQUIRED_PARAMS', message: 'All fields are required.' });
      return res.status(error.status).send(error);
   }

   if (password !== confirmPassword) {
      const error = API.toError({ status: 400, code: 'PASSWORD_MISMATCH', message: 'Passwords do not match.' });
      return res.status(error.status).send(error);
   }

   try {
      const { data } = await DB.query('users_schema', 'users').where({ email }).exec();
      const userExists = data;
      if (userExists.length) {
         const error = API.toError({ status: 400, code: 'EMAIL_EXISTS', message: 'Email already exists.' });
         return res.status(error.status).send(error);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await DB.create('users_schema.users', {
         first_name: firstName,
         last_name: lastName,
         email: email,
         password: hashedPassword
      });

      if (user.error) {
         const error = API.toError({ status: 400, code: 'DB_ERROR', message: 'Error registering user.' });
         return res.status(error.status).send(error);
      }

      req.session.user = {
         id: user.id,
         email: user.email,
         name: `${user.first_name} ${user.last_name}`,
      };

      const token = jwt.sign(req.session.user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '24h' });
      res.cookie('token', token, { httpOnly: true, secure: false });
      res.status(201).send({ success: true, message: 'User registered successfully.', user });
   } catch (error) {
      const errror = API.toError({ code: 'INTERNAL_SERVER_ERROR', message: 'An internal server error occurred.' });
      res.status(errror.status).send(errror);
   }  
}

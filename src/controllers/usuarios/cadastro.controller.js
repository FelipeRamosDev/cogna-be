const bcrypt = require('bcrypt');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const { firstName, lastName, email, password, confirmPassword } = req.body;

   if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).send({ error: true, message: 'All fields are required.' });
   }

   if (password !== confirmPassword) {
      return res.status(400).send({ error: true, message: 'Passwords do not match.' });
   }

   try {
      const userExists = await DB.read('users_schema.users', { email: { condition: '=', value: email } });
      if (userExists.length) {
         return res.status(400).send({ error: true, message: 'Email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await DB.create('users_schema.users', {
         first_name: firstName,
         last_name: lastName,
         email: email,
         password: hashedPassword
      });

      if (user.error) {
         return res.status(400).send({ error: true, message: 'Error registering user.' });
      }

      res.status(201).send({ success: true, message: 'User registered successfully.', user: user.data });
   } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).send({ error: true, message: 'An internal server error occurred.' });
   }  
}

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = async function(req, res) {
   const DB = this.getDataBase();
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
   }

   try {
      const [ user ] = await DB.read('users_schema.users', { email: { condition: '=', value: email } });
      if (!user) {
         return res.status(400).json({ message: 'Invalid email!' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         return res.status(400).json({ message: 'Invalid password!' });
      }

      req.session.user = {
         id: user.id,
         email: user.email,
         name: user.first_name + ' ' + user.last_name,
      };

      const token = jwt.sign(req.session.user, process.env.JWT_SECRET, { expiresIn: '5m' });
      res.cookie('token', token, { httpOnly: true, secure: true });

      res.status(200).json({ success: true, user });
   } catch (error) {
      console.error('Error in login controller:', error);
      res.status(500).json({ message: 'Internal server error' });
   }
}

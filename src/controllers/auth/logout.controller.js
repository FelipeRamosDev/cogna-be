module.exports = async (req, res) => {
   try {
      req.session.destroy((err) => {
         if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed', error: err });
         }

         res.clearCookie('token'); // Clear the session cookie
         return res.json({ success: true, message: 'Logout successful' });
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'An error occurred during logout', error });
   }
}

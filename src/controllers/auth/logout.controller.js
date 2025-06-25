const ErrorRequestHTTP = require("../../models/errors/ErrorRequestHTTP");

module.exports = async (req, res) => {
   try {
      if (!req.session || !req.session.destroy) {
         return new ErrorRequestHTTP('Session not found', 500, 'LOGOUT_ERROR').send(res);
      }

      req.session.destroy((err) => {
         if (err) {
            return new ErrorRequestHTTP('Logout failed', 500, 'LOGOUT_ERROR').send(res);
         }

         res.clearCookie('token'); // Clear the session cookie
         return res.send({ success: true, message: 'Logout successful' });
      });
   } catch (error) {
      return new ErrorRequestHTTP('An error occurred during logout', 500, 'LOGOUT_ERROR').send(res);
   }
}

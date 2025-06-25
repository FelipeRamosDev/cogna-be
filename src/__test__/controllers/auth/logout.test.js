const logoutController = require('../../../controllers/auth/logout.controller');

describe('Logout Controller', () => {
   let req, res;

   beforeEach(() => {
      req = { session: { destroy: jest.fn() } };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
         send: function (data) { return this.json(data); },
         clearCookie: jest.fn().mockReturnThis(),
      };
   });

   it('should destroy session, clear cookie, and return success', async () => {
      req.session.destroy.mockImplementation(cb => cb(null));
      await logoutController(req, res);
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logout successful' });
   });

   it('should handle session destroy error', async () => {
      const error = new Error('fail');
      req.session.destroy.mockImplementation(cb => cb(error));
      await logoutController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            error: true,
            message: 'Logout failed',
            code: 'LOGOUT_ERROR'
         })
      );
   });

   it('should handle unexpected error', async () => {
      req.session.destroy = undefined; // Will throw
      await logoutController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            error: true,
            message: 'Session not found',
            code: 'LOGOUT_ERROR'
         })
      );
   });
});

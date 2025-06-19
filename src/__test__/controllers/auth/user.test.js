const request = require('supertest');

describe('GET /auth/user', () => {
   let apiServer;
   let authCookie;
   const testUser = {
      email: 'test@test.com',
      password: 'Test!123',
   };

   beforeAll(async () => {
      apiServer = await require('../../../app');

      // Login and capture the cookie
      const loginRes = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: testUser.email, password: testUser.password });

      authCookie = loginRes.headers['set-cookie'];
   });

   it('should return user data if authenticated', async () => {
      const res = await request(apiServer.app)
         .get('/auth/user')
         .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
   });

   it('should return null if not authenticated', async () => {
      const res = await request(apiServer.app)
         .get('/auth/user');

      expect(res.status).toBe(401);
      expect(res.body.user).not.toBeDefined();
   });
});


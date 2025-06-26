const request = require('supertest');

describe('POST /auth/login', () => {
   let apiServer;
   const testUser = {
      email: 'test@test.com',
      password: 'Test!123',
   };

   beforeAll(async () => {
      apiServer = await require('../../../app');
   });

   it('should login successfully with valid credentials', async () => {
      const res = await request(apiServer.app)
         .post('/auth/login')
         .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
   });

   it('should not login with missing fields', async () => {
      const res = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
   });

   it('should not login with invalid email', async () => {
      const res = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: 'notfound@example.com', password: testUser.password });

      expect([400, 404]).toContain(res.status);
      expect(res.body.message).toMatch(/(invalid email|user not found)/i);
   });

   it('should not login with invalid password', async () => {
      const res = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: testUser.email, password: 'WrongPassword!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid password/i);
   });

   it('should handle internal server errors gracefully', async () => {
      // Simulate by sending an invalid payload (e.g., email as object)
      const res = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: { invalid: 'object' }, password: testUser.password });

      expect([400, 404, 500]).toContain(res.status);
   });
});


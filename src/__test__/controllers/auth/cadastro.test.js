const request = require('supertest');

describe('PUT /auth/cadastro', () => {
   let apiServer

   beforeAll(async () => {
      apiServer = await require('../../../app');
   });

   it('should register a new user successfully', async () => {
      const userData = {
         firstName: 'Test',
         lastName: 'User',
         email: `testuser_${Date.now()}@example.com`,
         password: 'Password123!',
         confirmPassword: 'Password123!'
      };

      const res = await request(apiServer.app)
         .put('/auth/cadastro')
         .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
   });

   it('should not register user with missing fields', async () => {
      const res = await request(apiServer.app)
         .put('/auth/cadastro')
         .send({
            firstName: 'Test',
            email: 'missingfields@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!'
         });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.message).toMatch(/All fields are required/);
   });
});


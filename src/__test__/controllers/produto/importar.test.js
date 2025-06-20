const request = require('supertest');
const dummy_products = require('../../../resources/dummy_products.json');

describe('POST /produto/importar', () => {
   let apiServer;
   let authCookie;
   
   beforeAll(async () => {
      apiServer = await require('../../../app');

      const loginResponse = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: 'test@test.com', password: 'Test!123' });

      // 2. Save the cookie from the response
      authCookie = loginResponse.headers['set-cookie'];
   });

   it('should import products successfully with valid data', async () => {
      const mockData = dummy_products;

      const response = await request(apiServer.app)
         .post('/produto/importar')
         .set('Cookie', authCookie) // 3. Send the cookie
         .attach('file', Buffer.from(JSON.stringify(mockData)), 'produtos.json')

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
   });

   it('should return 400 if data is missing', async () => {
      const response = await request(apiServer.app)
         .post('/produto/importar')
         .set('Cookie', authCookie) // 3. Send the cookie
         .send({})

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should return 400 if data is invalid', async () => {
      const invalidData = [
         { nome: '', preco: -5, estoque: 'invalid' }
      ];

      const response = await request(apiServer.app)
         .post('/produto/importar')
         .set('Cookie', authCookie) // 3. Send the cookie
         .send(invalidData)

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should handle server errors gracefully', async () => {
      // Simulate server error by sending data that triggers an error in the controller
      const errorData = null;

      const response = await request(apiServer.app)
         .post('/produto/importar')
         .set('Cookie', authCookie) // 3. Send the cookie
         .send(errorData)

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('error');
   });
});

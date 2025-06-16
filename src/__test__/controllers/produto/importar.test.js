const request = require('supertest');
const apiServer = require('../../../app');
const dummy_products = require('../../../resources/dummy_products.json');

describe('POST /produto/importar', () => {
   it('should import products successfully with valid data', async () => {
      const mockData = dummy_products;

      const response = await request(apiServer.app)
         .post('/produto/importar')
         .attach('file', Buffer.from(JSON.stringify(mockData)), 'produtos.json')

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
   });

   it('should return 400 if data is missing', async () => {
      const response = await request(apiServer.app)
         .post('/produto/importar')
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
         .send(invalidData)

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should handle server errors gracefully', async () => {
      // Simulate server error by sending data that triggers an error in the controller
      const errorData = null;

      const response = await request(apiServer.app)
         .post('/produto/importar')
         .send(errorData)

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('error');
   });
});

const request = require('supertest');

describe('PUT /produto/criar', () => {
   let apiServer;

   beforeAll(() => {
      apiServer = require('../../../app');
   });

   it('should create a product successfully with valid data', async () => {
      const newProduct = {
         name: 'Produto Teste',
         description: 'Descrição do produto teste',
         price: 100
      };

      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for server to start

      const response = await request(apiServer.app)
         .put('/produto/criar')
         .send(newProduct);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
   }, 20000);

   it('should return 400 if data is missing', async () => {
      const response = await request(apiServer.app)
         .put('/produto/criar')
         .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should return 400 if data is invalid', async () => {
      const invalidData = {
         name: '',
         price: -5,
         stock_quantity: 'invalid'
      };

      const response = await request(apiServer.app)
         .put('/produto/criar')
         .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should handle server errors gracefully', async () => {
      // Simulate server error by sending data that triggers an error in the controller
      const errorData = null;

      const response = await request(apiServer.app)
         .put('/produto/criar')
         .send(errorData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });
});

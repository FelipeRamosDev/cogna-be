const request = require('supertest');

describe('POST /produto/buscar', () => {
   let apiServer
   
   beforeAll(async () => {
      apiServer = await require('../../../app');
   });
   
   it('should return products successfully with valid query', async () => {
      const query = {
         where: { author_id: 1 },
         limit: 5,
         sort: { created_at: 'DESC' },
         selectFields: ['id', 'name', 'price', 'created_at', 'author_id'],
      };

      const response = await request(apiServer.app)
         .post('/produto/busca')
         .send(query);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeLessThanOrEqual(5);

      response.body.products.forEach(product => {
         expect(product).toHaveProperty('id');
         expect(product).toHaveProperty('name');
         expect(product).toHaveProperty('price');
         expect(product).toHaveProperty('created_at');
         expect(product).not.toHaveProperty('description');
         expect(product).not.toHaveProperty('stock_quantity');
         expect(product).not.toHaveProperty('category');
      });
   });

   it('should return 400 if query is invalid', async () => {
      const invalidQuery = {
         where: null, // Invalid where condition
         limit: -1, // Invalid limit
      };

      const response = await request(apiServer.app)
         .post('/produto/busca')
         .send(invalidQuery);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should handle server errors gracefully', async () => {
      // Simulate server error by sending data that triggers an error in the controller
      const errorData = null;

      const response = await request(apiServer.app)
         .post('/produto/busca')
         .send(errorData);

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error');
   });

   it('should return an empty array if no products match the query', async () => {
      const query = {
         where: {
            author_id: 9999, // Assuming this ID does not exist
         },
         limit: 5,
         sort: { created_at: 'desc' },
         selectFields: ['id', 'name', 'price', 'created_at'],
      };

      const response = await request(apiServer.app)
         .post('/produto/buscar')
         .send(query);

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBe(0);
   });
});
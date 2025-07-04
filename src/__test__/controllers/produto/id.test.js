const request = require('supertest');

describe('GET /produto/:id', () => {
   let apiServer
   
   beforeAll(async () => {
      apiServer = await require('../../../app');
   });

   it('should respond to GET /produto/:id with 200 or 404', async () => {
      const res = await request(apiServer.app).get('/produto/1');
      expect([200, 404]).toContain(res.statusCode);
   });

   it('should return product details in response', async () => {
      const res = await request(apiServer.app).get('/produto/1');

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product).toHaveProperty('id', 1);
      expect(res.body.product).toHaveProperty('name');
      expect(res.body.product).toHaveProperty('price');
   });

   it('should return error bad param if unknown id is provided', async () => {
      const res = await request(apiServer.app).get('/produto/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', true);
      expect(res.body).toHaveProperty('message', 'Product not found.');
   });

   it('should return error bad param if unknown id is provided', async () => {
      const res = await request(apiServer.app).get('/produto/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', true);
      expect(res.body).toHaveProperty('message', 'Product not found.');
   });
});
const request = require('supertest');

describe('GET /', () => {
   let apiServer
   
   beforeAll(async () => {
      apiServer = await require('../../app');
   }, 30000);

   it('should respond with 200', async () => {
      const res = await request(apiServer.app).get('/');

      expect(res.statusCode).toBe(200);
   });

   it('should return products in response', async () => {
      const res = await request(apiServer.app).get('/');

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
   });
});
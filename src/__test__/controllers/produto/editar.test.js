const request = require('supertest');

describe('POST /produto/editar', () => {
   let apiServer
   
   beforeAll(async () => {
      apiServer = await require('../../../app');
   });

   it('should update a product successfully with valid data', async () => {
      const updateData = {
         id: 1, // Assuming a product with ID 1 exists
         data: {
            name: 'Produto Atualizado',
            description: 'Descrição atualizada do produto',
            price: 150
         }
      };

      const response = await request(apiServer.app)
         .post('/produto/editar')
         .send(updateData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
   });

   it('should return 400 if id or data is missing', async () => {
      const response = await request(apiServer.app)
         .post('/produto/editar')
         .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });

   it('should return 400 if id or data is invalid', async () => {
      const invalidData = {
         id: null,
         data: {
            name: '',
            price: -10
         }
      };

      const response = await request(apiServer.app)
         .post('/produto/editar')
         .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });
});

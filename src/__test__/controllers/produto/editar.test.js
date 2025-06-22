const request = require('supertest');

describe('POST /produto/editar', () => {
   let apiServer;
   let authCookie;
   
   beforeAll(async () => {
      apiServer = await require('../../../app');
      
      const loginResponse = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: 'test@test.com', password: 'Test!123' });

      authCookie = loginResponse.headers['set-cookie'];
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
         .set('Cookie', authCookie)
         .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
   });

   it('should return 400 if id or data is missing', async () => {
      const response = await request(apiServer.app)
         .post('/produto/editar')
         .set('Cookie', authCookie)
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
         .set('Cookie', authCookie)
         .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
   });
});

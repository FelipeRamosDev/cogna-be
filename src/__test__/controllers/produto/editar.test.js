const request = require('supertest');

describe('POST /produto/editar', () => {
   let apiServer;
   let authCookie;
   let productId;
   let userId;
   
   beforeAll(async () => {
      apiServer = await require('../../../app');
      
      const loginResponse = await request(apiServer.app)
         .post('/auth/login')
         .send({ email: 'test@test.com', password: 'Test!123' });

      authCookie = loginResponse.headers['set-cookie'];

      // Busca o id do usuário autenticado
      const meRes = await request(apiServer.app)
         .get('/meu-perfil')
         .set('Cookie', authCookie);
      userId = meRes.body.user?.id || 1;

      // Cria um produto para garantir autoria
      const createRes = await request(apiServer.app)
         .post('/produto/criar')
         .set('Cookie', authCookie)
         .send({
            name: 'Produto Teste',
            description: 'Produto para teste de edição',
            price: 100,
            author_id: userId
         });
      productId = createRes.body.product?.id || 1;
   });

   it('should update a product successfully with valid data', async () => {
      const updateData = {
         id: productId, // Usa o produto criado
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

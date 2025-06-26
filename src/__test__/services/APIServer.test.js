const request = require('supertest');

describe('APIServer', () => {
   let apiServer

   beforeAll(async () => {
      apiServer = await require('../../app');
   });

   it('should initialize the database', async () => {
      if (apiServer.database) {
         expect(apiServer.database.pool).toBeDefined();
   
         const result = await apiServer.database.isConnected();
         expect(result).toBe(true);
      }
   });

   it('should start express and listen on the configured port', async () => {
      // Supondo que o APIServer exponha a porta e o host
      expect(apiServer.port).toBeDefined();
      expect(apiServer.host).toBeDefined();

      // Você pode tentar fazer uma requisição para garantir que está ouvindo
      const res = await request(apiServer.app).get('/');
      expect([200, 404]).toContain(res.status);
   });

   it('should register routes', () => {
      // Se o APIServer expõe as rotas registradas
      expect(apiServer.routes).toBeInstanceOf(Map);
      // Exemplo: deve ter pelo menos uma rota registrada
      expect(apiServer.routes.size).toBeGreaterThan(0);
   });

   it('should return 404 for unknown routes', async () => {
      const res = await request(apiServer.app).get('/unknown-route');
      expect(res.status).toBe(404);
   });
});

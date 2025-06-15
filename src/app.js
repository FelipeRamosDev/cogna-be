const APIServer = require('./services/APIServer');
const users_schema = require('./schemas/users_schema');
const product_schema = require('./schemas/products_schema');

console.log({
   onListen: () => console.log('The APIServer was initialized!'),
   port: process.env.SERVER_PORT,
   database: {
      type: process.env.DB_TYPE,
      user: process.env.DB_USER,
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      schemas: [
         users_schema,
         product_schema
      ],
   }
})
const apiServer = new APIServer({
   onListen: () => console.log('The APIServer was initialized!'),
   port: process.env.SERVER_PORT,
   database: {
      type: process.env.DB_TYPE,
      user: process.env.DB_USER,
      dbName: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      schemas: [
         users_schema,
         product_schema
      ],
   }
});

apiServer.init();

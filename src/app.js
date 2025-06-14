const APIServer = require('./services/APIServer');
const user_schema = require('./schemas/user_schema');
const product_schema = require('./schemas/products_schema');

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
         user_schema,
         product_schema
      ],
   }
});

apiServer.init();

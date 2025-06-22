require('dotenv').config();

const APIServer = require('./services/APIServer');
const users_schema = require('./schemas/users_schema');
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
         users_schema,
         product_schema
      ],
      onReady: async (database) => {
         try {
            const { data } = await database.select('products_schema', 'products').limit(1).exec();
            const products = data;

            if (!products.length) {
               const dummyProducts = require('./resources/dummy_products.json');
               
               for (const product of dummyProducts) {
                  await database.insert('products_schema', 'products').data(product).exec();
               }
            }
         } catch (error) {
            console.error('Error during database initialization:', error);
         }
      }
   }
});

module.exports = apiServer.init();

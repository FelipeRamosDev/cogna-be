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
            const query = database.select('products_schema', 'products').limit(1);
            const { data = [] } = await query.exec()
            const [ product ] = data;

            if (!product) {
               const dummyProducts = require('./resources/dummy_products.json');
               const { data = [] } = await database.select('users_schema', 'users').where({ email: 'test@test.com' }).exec();
               const [ testUser ] = data;
               
               if (!testUser) {
                  return;
               }

               for (const product of dummyProducts) {
                  product.author_id = testUser.id;

                  const created = await database.insert('products_schema', 'products').data(product).exec();
                  if (created.error) {
                     console.error('Error creating product:', created);
                  }
               }
            }
         } catch (error) {
            console.error('Error during database initialization:', error);
         }
      }
   }
});

module.exports = apiServer.init();

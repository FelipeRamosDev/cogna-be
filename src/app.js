const APIServer = require('./services/APIServer');

const apiServer = new APIServer({
   port: process.env.SERVER_PORT,
   onListen: () => console.log('The APIServer was initialized!')
});

apiServer.init();

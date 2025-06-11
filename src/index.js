const express = require('express');
const app = express();
const SERVER_PORT = process.env.SERVER_PORT;

if (!SERVER_PORT) {
   throw 'The enviroment variable SERVER_PORT is required to start the application!';
}

app.get('/', (req, res) => {
   console.log('Request at route "/" received!');

   res.send({
      success: true
   });
});

app.listen(SERVER_PORT, () => {
   console.log(`The API server is listening at: http://localhost:${SERVER_PORT}`);
});

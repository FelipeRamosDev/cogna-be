const Route = require('../../services/Route');

module.exports = new Route({
   path: '/auth/user',
   method: 'GET',
   authProtected: true
});

const Route = require('../../services/Route');

module.exports = new Route({
   path: '/auth/logout',
   method: 'POST',
   authProtected: true
});

const Schema = require('../models/Schema');
const users = require('./tables/users');

const user_schema = new Schema({
   name: 'users_schema',
   tables: [ users ]
});

module.exports = user_schema;

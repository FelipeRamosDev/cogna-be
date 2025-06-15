const Schema = require('../models/Schema');
const products = require('./tables/products');

const product_schema = new Schema({
   name: 'products_schema',
   tables: [ products ]
});

module.exports = product_schema;

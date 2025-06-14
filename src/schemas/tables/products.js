const Table = require("../../models/Table");

const products = new Table({
   name: 'products',
   fields: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'name', type: 'VARCHAR(255)', notNull: true },
      { name: 'description', type: 'TEXT' },
      { name: 'price', type: 'DECIMAL(10, 2)', notNull: true },
      { name: 'stock_quantity', type: 'INTEGER', notNull: true, defaultValue: 0 },
      { name: 'category_id', type: 'INTEGER', notNull: true }
   ]
});

module.exports = products;

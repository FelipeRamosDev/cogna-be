const Table = require("../../models/Table");

const products = new Table({
   name: 'products',
   fields: [
      { name: 'id', primaryKey: true },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'name', type: 'VARCHAR(255)', notNull: true },
      { name: 'description', type: 'TEXT' },
      { name: 'price', type: 'DECIMAL(10, 2)', notNull: true },
      { name: 'stock_quantity', type: 'INTEGER', defaultValue: 0 },
      { name: 'category_name', type: 'VARCHAR(255)', defaultValue: 'General' },
   ]
});

module.exports = products;

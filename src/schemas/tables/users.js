const Table = require("../../models/Table");

const users = new Table({
   name: 'users',
   fields: [
      { name: 'id', primaryKey: true },
      { name: 'first_name', type: 'VARCHAR(255)' },
      { name: 'last_name', type: 'VARCHAR(255)' },
      { name: 'email', type: 'VARCHAR(255)', unique: true },
      { name: 'password', type: 'VARCHAR(255)' },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
   ]
});

module.exports = users;

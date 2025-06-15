const Table = require("../../models/Table");

const users = new Table({
   name: 'users',
   fields: [
      { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
      { name: 'firstname', type: 'VARCHAR(255)', notNull: true },
      { name: 'lastname', type: 'VARCHAR(255)', notNull: true },
      { name: 'email', type: 'VARCHAR(255)', unique: true, notNull: true },
      { name: 'password', type: 'VARCHAR(255)', notNull: true },
      { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
   ]
});

module.exports = users;

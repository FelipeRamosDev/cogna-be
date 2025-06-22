const { Pool } = require('pg');
const DataBase = require('./DataBase');
const SelectSQL = require('./builders/SelectSQL');
const InsertSQL = require('./builders/InsertSQL');
const UpdateSQL = require('./builders/UpdateSQL');
const DeleteSQL = require('./builders/DeleteSQL');

class PostgresDB extends DataBase {
   /**
    * Initializes a new PostgresDB instance and connects to the PostgresSQL database.
    * @param {object} setup - Configuration object.
    * @param {string} [setup.user='postgres'] - Database user.
    * @param {number} [setup.port=5432] - Database port.
    * @param {string} [setup.dbName] - Database name (inherited).
    * @param {string} [setup.host] - Database host (inherited).
    * @param {string} [setup.password] - Database password (inherited).
    */
   constructor(setup = {}) {
      super(setup);

      const {
         user = 'postgres',
         port = 5432
      } = setup;

      this.type = 'postgres';
      this.user = user;
      this.port = port;

      this.pool = new Pool({
         user: this.user,
         database: this.dbName,
         host: this.host,
         password: this.password,
         port: this.port
      });
   }

   async init() {
      if (!this.pool || !this.pool.connect) {
         throw this.toError('Database connection pool is not initialized.');
      }

      try {
         await this.pool.connect();
         for (const schema of this.getSchemasArray()) {
            await this.createSchema(schema)
         }

         await this.onReady(this);
         await this.createTestUser();
         console.log('PostgresDB connected successfully');
      } catch (error) {
         throw this.toError('Failed to connect to PostgresDB: ' + error.message);
      }
   }

   async createTestUser() {
      try {
         const userQuery = this.select('users_schema', 'users').where({ email: 'test@test.com' }).limit(1);
         const { data: [ user ] } = await userQuery.exec();

         if (!user) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('Test!123', 10);

            const created = await this.insert('users_schema', 'users').data({
               first_name: 'Test',
               last_name: 'User',
               password: hashedPassword,
               email: 'test@test.com'
            }).exec();

            if (created.error) {
               throw created;
            }
         }
      } catch (error) {
         console.error(this.toError('Error creating test user: ' + error.message));
      }
   }

   async isConnected() {
      try {
         const result = await this.pool.query('SELECT 1');
         return Boolean(result.rowCount > 0);
      } catch (error) {
         this.toError('Error checking connection: ' + error.message);
         return false;
         
      }
   }

   getSchemasArray() {
      return Array.from(this.schemas.values());
   }

   /**
    * Creates a schema and optionally tables if they do not exist.
    * @param {string} schemaName - Name of the schema.
    * @param {Array} tables - Array of table definitions ({ name, fields }).
    */
   async createSchema(schema) {
      const { name: schemaName, tables = new Map() } = schema;

      try {
         await this.pool.query(schema.buildCreateSchemaQuery());
      } catch (error) {
         this.toError('Error creating schema: ' + error.message);
         return;
      }

      try {
         for (const table of Array.from(tables.values())) {
            await this.createTable(schemaName, table);
         }
      } catch (error) {
         this.toError('Error creating tables: ' + error.message);
      }
   }

   /**
    * Creates a table with the specified columns in a given schema.
    * @param {string} schema - Schema name.
    * @param {string} tableName - Table name.
    * @param {Array} columns - Array of column definitions ({ name, type }).
    */
   async createTable(schemaName, table) {
      const querySQL = table.buildCreateTableQuery(schemaName);

      try {
         await this.pool.query(querySQL);
         await this.syncTable(table.name, schemaName, table.fields);
      } catch (error) {;
         return this.toError(`Error creating table ${table.name} in schema ${schemaName}: ${error.message}`);

      }
   }

   /**
    * Synchronizes the table structure with the provided configuration.
    * Adds missing columns and removes extra columns.
    * @param {string} tableName - Table name.
    * @param {string} schemaName - Schema name.
    * @param {Array} columnsConfig - Array of column definitions ({ name, type }).
    */
   async syncTable(tableName, schemaName, columnsConfig) {
      const { rows: currentColumns } = await this.pool.query(`
         SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         `,
         [schemaName, tableName]
      );

      const currentMap = {};
      currentColumns.forEach(col => {
         currentMap[col.column_name] = col;
      });

      for (const col of columnsConfig) {
         if (!currentMap[col.name]) {
            await this.pool.query(
               `ALTER TABLE ${schemaName}.${tableName} ADD COLUMN ${col.name} ${col.type} ${col.notNull ? 'NOT NULL' : ''}`
            );
         }
      }

      for (const col of currentColumns) {
         if (!columnsConfig.find(c => c.name === col.column_name)) {
            await this.pool.query(
               `ALTER TABLE ${schemaName}.${tableName} DROP COLUMN ${col.column_name}`
            );
         }
      }
   }

   insert(schemaName, tableName) {
      return new InsertSQL(this, schemaName, tableName);
   }

   select(schemaName, tableName) {
      return new SelectSQL(this, schemaName, tableName);
   }

   update(schemaName, tableName) {
      return new UpdateSQL(this, schemaName, tableName);
   }

   delete(schemaName, tableName) {
      return new DeleteSQL(this, schemaName, tableName);
   }

   toError(error, code = 500) {
      if (typeof error === 'string') {
         return {
            code,
            error: true,
            message: error,
         };
      } else {
         return {
            code: error.code || code,
            error: true,
            message: error.message || 'An unknown error occurred!',
         };
      }
   }
}

module.exports = PostgresDB;

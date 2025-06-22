const { Pool } = require('pg');
const DataBase = require('./DataBase');
const GetQuerySQL = require('./builders/GetQuerySQL');
const UpdateQuerySQL = require('./builders/UpdateQuerySQL');

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
         const userQuery = this.query('users_schema', 'users').where({ email: 'test@test.com' }).limit(1);
         const { data: [ user ] } = await userQuery.exec();

         if (!user) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('Test!123', 10);

            const created = await this.create('users_schema.users', {
               first_name: 'Test',
               last_name: 'User',
               password: hashedPassword,
               email: 'test@test.com'
            });

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
    * Builds a SQL WHERE clause from conditions.
    * Supports both AND (object) and OR (array) conditions.
    * @param {object|array} conditions - Conditions for the WHERE clause.
    * @param {number} [startIndex=1] - Starting index for parameter placeholders.
    * @returns {string} - SQL WHERE clause.
    */
   buildWhere(conditions = {}, startIndex = 1) {
      let result = '';

      if (Array.isArray(conditions)) {
         // If conditions is an array, we assume it's a list of OR conditions

         result = conditions.map((current, idx) => {
            const [key, props] = current;
            const operator = props.operator || '=';

            return `${key} ${operator} $${idx + startIndex}`;
         }).join(' OR ');
      } else if (typeof conditions === 'object') {
         // If conditions is an object, we assume it's a list of AND conditions

         result = Object.entries(conditions).map((current, idx) => {
            const [key, props] = current;
            const operator = props.operator || '=';

            return `${key} ${operator} $${idx + startIndex}`;
         }).join(' AND ');
      }

      return result;
   }

   /**
    * Builds a SQL SET clause for updates.
    * @param {object} data - Fields to update.
    * @returns {string} - SQL SET clause.
    */
   buildSet(data = {}) {
      const dataEntries = Object.keys(data);

      if (dataEntries.length === 0) {
         return '';
      }

      const parsed = dataEntries.map((key, index) => `${key} = $${index + 1}`);
      return parsed.join(', ');
   }

   /**
    * Extracts values from condition objects for parameterized queries.
    * @param {object} conditions - Condition object.
    * @returns {array} - Array of values.
    */
   getConditionValues(conditions = {}) {
      if (Array.isArray(conditions)) {
         // Array of OR conditions: each entry is [key, { value, operator }]
         return conditions.map(([_, props]) => props.value);
      } else if (typeof conditions === 'object' && conditions !== null) {
         // Object of AND conditions: { key: { value, operator } }
         return Object.keys(conditions).map((key) => {
            const props = conditions[key];
            return props.value;
         });
      } else {
         return [];
      }
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

   /**
    * Inserts a new record into a table.
    * @param {string} tableName - Table name (with schema if needed).
    * @param {object} data - Object with fields and values to insert.
    * @returns {Promise<object>} - The inserted record.
    */
   async create(tableName, data) {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
         throw this.toError('Invalid data provided for insert.');
      }

      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

      const query = `
         INSERT INTO ${tableName} (${columns.join(', ')})
         VALUES (${placeholders})
         RETURNING *;
      `;

      try {
         const result = await this.pool.query(query, values);
         return result.rows[0];
      } catch (error) {
         if (error.code === '22P02') { // Invalid text representation
            error.code = 400; // Bad Request
            return this.toError(error);
         }

         return this.toError(error);
      }
   }

   query(schemaName, tableName) {
      return new GetQuerySQL(this, schemaName, tableName);
   }

   /**
    * Updates records in a table based on conditions.
    * @param {string} schema_table - Table name (with schema).
    * @param {object} condition - Conditions for the WHERE clause. An array of conditions can be used for OR logic. If an object is provided, it will be treated as AND conditions.
    * @param {object} data - Object with fields and values to update.
    * @returns {Promise<Array>} - Array of updated records.
    */
   update(schemaName, tableName) {
      // const fields = Object.keys(data);
      // const values = Object.values(data);
      // const conditionsValues = this.getConditionValues(condition);

      // // Build SET and WHERE clauses for SQL: "field1 = $1, field2 = $2, ..."
      // const setClause = this.buildSet(data);
      // const whereClause = this.buildWhere(condition, fields.length + 1);

      // // The parameter for the WHERE clause comes after the fields to be updated
      // const sql = `UPDATE ${schema_table} SET ${setClause} WHERE ${whereClause} RETURNING *`;

      // // Array of values: [...field values, ...condition values]
      // const params = [...values, ...conditionsValues];

      // const result = await this.pool.query(sql, params);
      // return result.rows;

      return new UpdateQuerySQL(this, schemaName, tableName);
   }

   /**
    * Deletes records from a table based on conditions.
    * @param {string} tableName - Table name (with schema if needed).
    * @param {object|array} conditions - Conditions for the WHERE clause. An array of conditions can be used for OR logic. If an object is provided, it will be treated as AND conditions.
    * @returns {Promise<Array>} - Array of deleted records.
    */
   async delete(tableName, conditions) {
      const whereClause = this.buildWhere(conditions);
      if (!whereClause) {
         this.toError('No conditions provided for delete.');
         return;
      }

      const query = `
         DELETE FROM ${tableName}
         ${whereClause ? `WHERE ${whereClause}` : ''}
         RETURNING *;
      `;

      try {
         const values = this.getConditionValues(conditions);
         const result = await this.pool.query(query, values);
         return result.rows;
      } catch (error) {
         this.toError('Error deleting record from database: ' + error.message);
      }
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

const DataBase = require('./DataBase');
const { Pool } = require('pg');

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

      this.schemas.map(schema => this.createSchema(schema));
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
      const { name: schemaName, tables = [] } = schema;

      try {
         await this.pool.query(`
            CREATE SCHEMA IF NOT EXISTS ${schemaName};
         `);
      } catch (error) {
         console.error('Error creating schema:', error);
         return;
      }

      try {
         tables.map(table => {
            const { name, fields } = table;
            return this.createTable(schemaName, name, fields);
         });
      } catch (error) {
         console.error('Error creating tables:', error);
      }
   }

   /**
    * Creates a table with the specified columns in a given schema.
    * @param {string} schema - Schema name.
    * @param {string} tableName - Table name.
    * @param {Array} columns - Array of column definitions ({ name, type }).
    */
   async createTable(schema, tableName, columns) {
      try {
         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (
               ${columns.map(col => `${col.name} ${col.type}`).join(', ')}
            );
         `);

         await this.syncTable(tableName, schema, columns);
      } catch (error) {
         console.error(`Error creating table ${tableName} in schema ${schema}:`, error);
         return;

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
            await pool.query(
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
         console.error('Error creating record on database:', error);
      }
   }

   /**
    * Reads records from a table with optional conditions.
    * @param {string} tableName - Table name (with schema if needed).
    * @param {object|array} conditions - Conditions for the WHERE clause. An array of conditions can be used for OR logic. If an object is provided, it will be treated as AND conditions.
    * @returns {Promise<Array>} - Array of records.
    */
   async read(tableName, conditions) {
      const whereClause = this.buildWhere(conditions);

      const query = `
         SELECT * FROM ${tableName}
         ${whereClause ? `WHERE ${whereClause}` : ''}
      `;

      try {
         const values = this.getConditionValues(conditions);
         const result = await this.pool.query(query, values);

         return result.rows;
      } catch (error) {
         console.error('Error reading records from database:', error);
         return [];
      }
   }

   /**
    * Updates records in a table based on conditions.
    * @param {string} schema_table - Table name (with schema).
    * @param {object} condition - Conditions for the WHERE clause. An array of conditions can be used for OR logic. If an object is provided, it will be treated as AND conditions.
    * @param {object} data - Object with fields and values to update.
    * @returns {Promise<Array>} - Array of updated records.
    */
   async update(schema_table, condition, data) {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const conditionsValues = this.getConditionValues(condition);

      // Build SET and WHERE clauses for SQL: "field1 = $1, field2 = $2, ..."
      const setClause = this.buildSet(data);
      const whereClause = this.buildWhere(condition, fields.length + 1);

      // The parameter for the WHERE clause comes after the fields to be updated
      const sql = `UPDATE ${schema_table} SET ${setClause} WHERE ${whereClause} RETURNING *`;

      // Array of values: [...field values, ...condition values]
      const params = [...values, ...conditionsValues];

      const result = await this.pool.query(sql, params);
      return result.rows;
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
         console.error('No conditions provided for delete.');
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
         console.error('Error deleting record from database:', error);
      }

   }
}

module.exports = PostgresDB;

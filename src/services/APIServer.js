const express = require('express');
const fs = require('fs');
const path = require('path');
const Route = require('./Route');

/**
 * APIServer Service
 * 
 * This class provides a modular and extensible Express-based API server.
 * It supports automatic discovery and registration of route modules from the routes directory,
 * manages route validation, and integrates middleware.
 *
 */
class APIServer {
   /**
    * Constructs a new APIServer instance.
    * @param {Object} setup - Configuration object.
    * @param {string} [setup.host='0.0.0.0'] - The host for the server to listen on.
    * @param {number} [setup.port=8000] - The port number for the server to listen on.
    * @param {Function[]} [setup.middlewares=[]] - Server middlewares.
    * @param {Function} [setup.onListen=() => {}] - Callback function to execute when the server starts listening.
    * @param {object} [setup.database] - An instance of a database service (e.g., PostgresDB, MongoDB) to be used by the server.
    * @param {'postgres' | 'mongodb'} [setup.database.type] - The type of database (e.g., 'postgres', 'mongodb').
    * @param {string} [setup.database.dbName] - The name of the database to connect to.
    * @param {string} [setup.database.host='localhost'] - The host of the database server.
    * @param {number} [setup.database.port=5432] - The port of the database server.
    * @param {string} [setup.database.password=''] - The password for the database connection.
    * @param {string} [setup.database.user] - The user for the database connection.
    */
   constructor (setup = {}) {
      const {
         host = '0.0.0.0',
         port = 8000,
         middlewares = [],
         onListen = () => {},
         database,
      } = setup;

      this.app = express();
      this.database = database;

      this.host = host;
      this.port = port;
      this.middlewares = middlewares;
      this.onListen = onListen;
      this.routes = new Map();

      if (this.database) {
         switch (this.database.type) {
            case 'postgres':
               const PostgresDB = require('./DataBase/PostgreDB');
               this.database = new PostgresDB(this.database);
               break;
            case 'mongodb':
               // MongoDB is not implemented yet
               break;
            default:
               console.warn('Unknown database type or database instance is not provided.');
         }
      }
   }

   /**
    * Initializes the API server by loading routes and starting the Express app.
    */
   init() {
      this.middlewares.map(middleware => this.app.use(middleware));
      
      this.loadRoutes();
      this.app.listen(this.port, this.host, this.onListen);
   }

   /**
    * Registers a route with the server if it is a valid Route instance and not already registered.
    * @param {Route} route - The route instance to register.
    */
   setRoute(route) {
      const isExist = this.routes.get(route.path);
      if (!(route instanceof Route) || this.routes.get(route.path)) {
         if (isExist) {
            console.warn(`Route "${isExist.path}" already exist! Only the first one will be active.`);
         }

         return;
      }

      this.routes.set(route.path, route);
      this.app.use(route.router);
   }

   /**
    * Loads all route modules from the routes directory and registers them.
    */
   loadRoutes() {
      const routesDir = path.join(__dirname, '../routes');
      const jsFiles = this.findRouteFiles(routesDir);

      jsFiles.forEach(filePath => {
         const route = require(filePath);
         this.setRoute(route);
      });
   }

   /**
    * Recursively finds all .js files in the given directory.
    * @param {string} dir - The directory to search for route files.
    * @param {string[]} [fileList=[]] - The accumulator for found file paths.
    * @returns {string[]} Array of file paths to .js files.
    */
   findRouteFiles(dir, fileList = []) {
      if (!fs.existsSync(dir)) {
         return fileList;
      }

      const files = fs.readdirSync(dir);
      files.forEach(file => {
         const filePath = path.join(dir, file);
         const stat = fs.statSync(filePath);

         if (stat.isDirectory()) {
            this.findRouteFiles(filePath, fileList);
         } else if (file.endsWith('.route.js')) {
            fileList.push(filePath);
         }
      });

      return fileList;
   }
}

module.exports = APIServer;

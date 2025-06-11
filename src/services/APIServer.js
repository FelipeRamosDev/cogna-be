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
    * @param {number} [setup.port=8000] - The port number for the server to listen on.
    * @param {Function[]} [setup.middlewares=[]] - Server middlewares.
    * @param {Function} [setup.onListen=() => {}] - Callback function to execute when the server starts listening.
    */
   constructor (setup = {}) {
      const {
         port = 8000,
         middlewares = [],
         onListen = () => {}
      } = setup;

      this.app = express();
      this.port = port;
      this.middlewares = middlewares;
      this.onListen = onListen;
      this.routes = new Map();
   }

   /**
    * Initializes the API server by loading routes and starting the Express app.
    */
   init() {
      this.middlewares.map(middleware => this.app.use(middleware));
      
      this.loadRoutes();
      this.app.listen(this.port, this.onListen);
   }

   /**
    * Registers a route with the server if it is a valid Route instance and not already registered.
    * @param {Route} route - The route instance to register.
    */
   setRoute(route) {
      if (!(route instanceof Route) || this.routes.get(route.path)) {
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
         } else if (file.endsWith('.js')) {
            fileList.push(filePath);
         }
      });

      return fileList;
   }
}

module.exports = APIServer;

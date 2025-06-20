const express = require('express');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * Route Service
 *
 * This class encapsulates the creation and registration of routes in an Express application.
 * It allows you to define the path, HTTP method, middlewares, and controller for each route.
 *
 * Note: All routes are registered on a shared router instance.
 */
class Route {
   /**
    * @param {Object} setup - Route configuration object.
    * @param {string} setup.path - The route path (e.g., '/users').
    * @param {'GET'|'POST'|'PUT'|'DELETE'} setup.method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
    *  @param {boolean} [setup.authProtected=false] - Whether the route requires authentication.
    * @param {Function[]} [setup.middlewares] - Optional array of Express middleware functions.
    * @param {Function} setup.controller - The route handler/controller function.
    *
    */
   constructor (setup = {}, apiServer) {
      const {
         path,
         method,
         controller,
         authProtected = false,
         middlewares = []
      } = setup;

      this.setApiServer(apiServer);
      this.router = express.Router();
      this.validateConfigs(setup);

      this.path = path;
      this.method = method;
      this.controller = controller;
      this.authProtected = authProtected;

      if (this.authProtected) {
         this.middlewares = [ authenticateToken, ...middlewares ];
      } else {
         this.middlewares = middlewares;
      }

      this.loadController();
      this.setRoute();
   }

   get apiServer() {
      return this._apiServer();
   }

   setApiServer(apiServer) {
      this._apiServer = () => apiServer;
   }

   /**
    * Registers the route on the shared router instance.
    */
   setRoute() {
      const method = this.method.toLowerCase();
      this.router[method](this.path, ...this.middlewares, this.controller);
   }

   /**
    * Validates the setup object for required properties and allowed HTTP methods.
    * @param {Object} setup - The route configuration object.
    * @throws {Error} If required properties are missing or method is invalid.
    */
   validateConfigs(setup) {
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

      if (!setup.path) {
         throw new Error(`It's required to declare a path for the Route service!`);
      }

      if (!setup.method || typeof setup.method !== 'string') {
         throw new Error(`It's required to select a method for the Route service! Allowed methods are: ${allowedMethods.join(', ')}`);
      }

      if (!allowedMethods.includes(setup.method.toUpperCase())) {
         throw new Error(`Invalid method "${setup.method}" for the Route service! Allowed methods are: ${allowedMethods.join(', ')}`);
      }
   }

   /**
    * Loads the controller function for the route.
    * - If a controller is already provided, it does nothing.
    * - Otherwise, attempts to load the controller from the controllers directory based on the route path.
    * - If the controller file does not exist or does not export a function, sets a default empty function as the controller.
    */
   loadController() {
      const controllersDir = path.resolve(__dirname, '../controllers');
      const filePath = this.path === '/' ? '/index.controller.js' : this.path + '.controller.js';
      const controllerFilePath = path.join(controllersDir, filePath.replace(/^[/]+|:/g, ''));
      const controllerContext = {
         getAPI: () => this.apiServer,
         getDataBase: () => this.apiServer?.database,
      };

      if (this.controller) {
         this.controller = this.controller.bind(controllerContext);
         return;
      }

      if (fs.existsSync(controllerFilePath)) {
         const controller = require(controllerFilePath);

         if (typeof controller !== 'function') {
            this.controller = () => {};
         } else {
            this.controller = controller.bind({
               getAPI: () => this.apiServer,
               getDataBase: () => this.apiServer?.database,
            });
         }
      } else {
         this.controller = () => {};
      }
   }
}

module.exports = Route;

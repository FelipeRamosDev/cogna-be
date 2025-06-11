const express = require('express');
const router = express.Router();

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
    * @param {Function[]} [setup.middlewares] - Optional array of Express middleware functions.
    * @param {Function} setup.controller - The route handler/controller function.
    *
    */
   constructor (setup = {}) {
      const {
         path,
         method,
         middlewares = [],
         controller = () => {}
      } = setup;

      this.validateConfigs(setup);

      this.path = path;
      this.method = method;
      this.middlewares = middlewares;
      this.controller = controller;
      this.router = router;

      this.setRoute();
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
}

module.exports = Route;

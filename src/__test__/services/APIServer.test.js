const express = require('express');
const APIServer = require('../../services/APIServer');
const Route = require('../../services/Route');

jest.mock('express');
jest.mock('fs');
jest.mock('path');
jest.mock('../../services/Route');

describe('APIServer', () => {
   let server;
   let mockApp;

   beforeEach(() => {
      mockApp = {
         use: jest.fn(),
         listen: jest.fn()
      };
      express.mockReturnValue(mockApp);
      server = new APIServer();
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   it('should initialize with default values', () => {
      expect(server.port).toBe(8000);
      expect(server.middlewares).toEqual([]);
      expect(typeof server.onListen).toBe('function');
      expect(server.routes instanceof Map).toBe(true);
   });

   it('should apply middlewares and start server on init', () => {
      const middleware = jest.fn((req, res, next) => next());
      server.middlewares = [middleware];
      server.loadRoutes = jest.fn();

      server.init();

      expect(mockApp.use).toHaveBeenCalledWith(middleware);
      expect(server.loadRoutes).toHaveBeenCalled();
      expect(mockApp.listen).toHaveBeenCalledWith(server.port, server.onListen);
   });

   it('should register a valid Route instance', () => {
      const route = new Route({ path: '/', method: 'GET' });

      server.setRoute(route);

      expect(server.routes.get(route.path)).toBeDefined();
      expect(server.routes.get(route.path) instanceof Route).toBe(true);
      expect(mockApp.use).toHaveBeenCalledWith(route.router);
   });

   it('should not register an invalid Route instance', () => {
      const route = { path: '/test', router: {} };
      server.setRoute(route);
      expect(mockApp.use).not.toHaveBeenCalled();
   });
});
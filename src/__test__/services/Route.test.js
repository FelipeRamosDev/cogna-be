const Route = require('../../services/Route');

describe('Route Service', () => {
  it('should throw error if path is missing', () => {
    expect(() => {
      new Route({
        method: 'GET',
        controller: () => {},
      });
    }).toThrow(/declare a path/);
  });

  it('should throw error if method is missing', () => {
    expect(() => {
      new Route({
        path: '/no-method',
        controller: () => {},
      });
    }).toThrow(/select a method/);
  });

  it('should throw error if method is invalid', () => {
    expect(() => {
      new Route({
        path: '/invalid-method',
        method: 'PATCH',
        controller: () => {},
      });
    }).toThrow(/Invalid method/);
  });
});

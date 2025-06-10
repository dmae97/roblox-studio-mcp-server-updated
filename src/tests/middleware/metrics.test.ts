import { Request, Response, NextFunction } from 'express';
import { metricsMiddleware, getMetrics, resetMetrics } from '../../middlewares/metrics.js';

describe('Metrics Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Reset metrics before each test
    resetMetrics();
    
    // Mock request, response, and next function
    req = {
      method: 'GET',
      originalUrl: '/test',
    };
    
    res = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'finish') {
          // Simulate response finish event
          callback();
        }
        return res;
      }),
    };
    
    next = jest.fn();
  });

  test('should track request metrics', () => {
    metricsMiddleware(req as Request, res as Response, next);
    
    // Verify that next was called
    expect(next).toHaveBeenCalled();
    
    // Verify that metrics were collected
    const metrics = getMetrics();
    expect(metrics.requests.total).toBe(1);
    expect(metrics.requests.byMethod['GET']).toBe(1);
    expect(metrics.requests.byStatus['200']).toBe(1);
  });

  test('should track request duration', () => {
    metricsMiddleware(req as Request, res as Response, next);
    
    // Verify that request duration metrics were collected
    const metrics = getMetrics();
    expect(metrics.performance.avgRequestDuration).toBeGreaterThanOrEqual(0);
    expect(Object.keys(metrics.performance.avgRequestDurationByPath).length).toBe(1);
    expect(metrics.performance.avgRequestDurationByPath['/test']).toBeGreaterThanOrEqual(0);
  });

  test('should track error requests', () => {
    // Simulate an error response
    res.statusCode = 500;
    
    metricsMiddleware(req as Request, res as Response, next);
    
    // Verify that error metrics were collected
    const metrics = getMetrics();
    expect(metrics.errors).toBe(1);
    expect(metrics.requests.byStatus['500']).toBe(1);
  });

  test('should normalize paths to prevent cardinality explosion', () => {
    // Simulate requests with numeric IDs in paths
    const req1 = { ...req, originalUrl: '/users/123' };
    const req2 = { ...req, originalUrl: '/users/456' };
    
    metricsMiddleware(req1 as Request, res as Response, next);
    metricsMiddleware(req2 as Request, res as Response, next);
    
    // Verify that paths were normalized
    const metrics = getMetrics();
    expect(metrics.performance.avgRequestDurationByPath).toHaveProperty('/users/:id');
    expect(metrics.requests.total).toBe(2);
  });

  test('should include system metrics', () => {
    // Verify that system metrics are included
    const metrics = getMetrics();
    expect(metrics.system).toBeDefined();
    expect(metrics.system.uptime).toBeGreaterThanOrEqual(0);
    expect(metrics.system.memory).toBeDefined();
  });
});

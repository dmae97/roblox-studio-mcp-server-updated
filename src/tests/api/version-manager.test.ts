import { Request, Response, NextFunction, Router } from 'express';
import { ApiVersionManager } from '../../controllers/api/version-manager.js';

describe('ApiVersionManager', () => {
  let versionManager: ApiVersionManager;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;
  let mockV1Router: Router;
  let mockV2Router: Router;

  beforeEach(() => {
    // Initialize ApiVersionManager
    versionManager = new ApiVersionManager();
    
    // Create mock routers
    mockV1Router = Router();
    mockV2Router = Router();
    
    // Register versions
    versionManager.registerVersion({ version: 'v1', router: mockV1Router });
    versionManager.registerVersion({ version: 'v2', router: mockV2Router });
    
    // Set up mocks
    mockRequest = {
      path: '',
      originalUrl: '',
      url: '',
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });

  describe('registerVersion', () => {
    test('should register a new API version', () => {
      const mockV3Router = Router();
      versionManager.registerVersion({ version: 'v3', router: mockV3Router });
      
      // Set default to v3 and verify it works
      versionManager.setDefaultVersion('v3');
      expect(versionManager.getDefaultVersion()).toBe('v3');
    });

    test('should throw error when registering duplicate version', () => {
      expect(() => {
        versionManager.registerVersion({ version: 'v1', router: Router() });
      }).toThrow('API version v1 is already registered');
    });
  });

  describe('setDefaultVersion', () => {
    test('should set the default API version', () => {
      versionManager.setDefaultVersion('v2');
      expect(versionManager.getDefaultVersion()).toBe('v2');
    });

    test('should throw error when setting non-existent version as default', () => {
      expect(() => {
        versionManager.setDefaultVersion('v99');
      }).toThrow('Cannot set non-existent API version v99 as default');
    });
  });

  describe('createVersioningMiddleware', () => {
    test('should route to the correct version based on URL path', () => {
      const middleware = versionManager.createVersioningMiddleware();
      
      // Set up request to v2
      mockRequest.path = '/v2/resource';
      mockRequest.originalUrl = '/api/v2/resource';

      // Mock the router handler for v2
      const mockRouterHandler = jest.fn();
      mockV2Router.handle = mockRouterHandler;

      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify router was called
      expect(mockRouterHandler).toHaveBeenCalled();
    });

    test('should route to default version when no version specified', () => {
      const middleware = versionManager.createVersioningMiddleware();
      
      // Set default version
      versionManager.setDefaultVersion('v1');
      
      // Set up request with no version
      mockRequest.path = '/resource';
      mockRequest.originalUrl = '/api/resource';

      // Mock the router handler for v1
      const mockRouterHandler = jest.fn();
      mockV1Router.handle = mockRouterHandler;

      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify router was called
      expect(mockRouterHandler).toHaveBeenCalled();
    });

    test('should return 404 for non-existent API version', () => {
      const middleware = versionManager.createVersioningMiddleware();
      
      // Set up request to non-existent version
      mockRequest.path = '/v99/resource';
      mockRequest.originalUrl = '/api/v99/resource';

      // Call middleware
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify 404 response
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'API version not found',
        message: 'API version v99 does not exist',
      });
    });
  });

  describe('getVersionedRouter', () => {
    test('should return the router for a specific version', () => {
      const v1Router = versionManager.getVersionedRouter('v1');
      const v2Router = versionManager.getVersionedRouter('v2');
      
      expect(v1Router).toBe(mockV1Router);
      expect(v2Router).toBe(mockV2Router);
    });

    test('should throw error for non-existent version', () => {
      expect(() => {
        versionManager.getVersionedRouter('v99');
      }).toThrow('API version v99 does not exist');
    });
  });
});

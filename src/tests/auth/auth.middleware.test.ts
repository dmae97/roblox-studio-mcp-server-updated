import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../../controllers/auth/auth-middleware.js';
import { AuthService } from '../../services/auth/auth-service.js';

// Mock dependencies
jest.mock('../../services/auth/auth-service.js');

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request, response, and next function objects
    mockReq = {
      headers: {},
      user: undefined,
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
    
    // Create a new instance of AuthMiddleware for each test
    authMiddleware = new AuthMiddleware();
  });

  describe('verifyToken', () => {
    it('should return 401 if no authorization header is provided', () => {
      // Test with no authorization header
      authMiddleware.verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header format is invalid', () => {
      // Test with invalid authorization header format
      mockReq.headers = {
        authorization: 'InvalidFormat token123',
      };

      authMiddleware.verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token format invalid',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', () => {
      // Test with valid format but invalid token
      mockReq.headers = {
        authorization: 'Bearer invalid_token',
      };

      // Mock token verification to throw an error
      jest.spyOn(AuthService.prototype, 'verifyToken').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next and attach user to request if token is valid', () => {
      // Test with valid token
      mockReq.headers = {
        authorization: 'Bearer valid_token',
      };

      // Mock successful token verification
      const mockUser = {
        userId: 1,
        username: 'testuser',
        role: 'user',
      };
      
      jest.spyOn(AuthService.prototype, 'verifyToken').mockReturnValue(mockUser);

      authMiddleware.verifyToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('checkAdminRole', () => {
    it('should return 401 if user is not authenticated', () => {
      // Test with no user attached to request
      authMiddleware.checkAdminRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not an admin', () => {
      // Test with non-admin user
      mockReq.user = {
        userId: 2,
        username: 'testuser',
        role: 'user',
      };

      authMiddleware.checkAdminRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin privileges required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if user is an admin', () => {
      // Test with admin user
      mockReq.user = {
        userId: 1,
        username: 'admin',
        role: 'admin',
      };

      authMiddleware.checkAdminRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});

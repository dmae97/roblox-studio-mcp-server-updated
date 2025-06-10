import { Request, Response } from 'express';
import { AuthController } from '../../controllers/auth/auth-controller.js';
import { AuthService } from '../../services/auth/auth-service.js';

// Mock dependencies
jest.mock('../../services/auth/auth-service.js');

describe('AuthController', () => {
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request and response objects
    mockReq = {
      body: {},
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Create a new instance of AuthController for each test
    authController = new AuthController();
  });

  describe('login', () => {
    it('should return 400 if username or password is missing', async () => {
      // Test with missing credentials
      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username and password are required',
      });
    });

    it('should return 401 if login service throws an error', async () => {
      // Mock request with credentials
      mockReq.body = {
        username: 'testuser',
        password: 'password123',
      };

      // Mock login service to throw an error
      jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(new Error('Invalid credentials'));

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('should return 200 and tokens if login is successful', async () => {
      // Mock request with credentials
      mockReq.body = {
        username: 'testuser',
        password: 'password123',
      };

      // Mock successful login service response
      const mockTokens = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        expiresIn: 3600,
      };
      
      jest.spyOn(AuthService.prototype, 'login').mockResolvedValue(mockTokens);

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockTokens,
      });
    });
  });

  describe('refreshToken', () => {
    it('should return 400 if refresh token is missing', async () => {
      // Test with missing refresh token
      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required',
      });
    });

    it('should return 401 if refresh service throws an error', async () => {
      // Mock request with refresh token
      mockReq.body = {
        refreshToken: 'invalid_refresh_token',
      };

      // Mock refresh service to throw an error
      jest.spyOn(AuthService.prototype, 'refreshToken').mockRejectedValue(new Error('Invalid refresh token'));

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token',
      });
    });

    it('should return 200 and new tokens if refresh is successful', async () => {
      // Mock request with refresh token
      mockReq.body = {
        refreshToken: 'valid_refresh_token',
      };

      // Mock successful refresh service response
      const mockTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 3600,
      };
      
      jest.spyOn(AuthService.prototype, 'refreshToken').mockResolvedValue(mockTokens);

      await authController.refreshToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: mockTokens,
      });
    });
  });

  describe('validateToken', () => {
    it('should return 200 with token validation success message', async () => {
      await authController.validateToken(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token is valid',
      });
    });
  });
});

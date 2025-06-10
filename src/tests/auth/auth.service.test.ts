import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthService } from '../../services/auth/auth-service.js';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of AuthService for each test
    authService = new AuthService();
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      // Test for a non-existent user
      await expect(authService.login('nonexistent', 'password'))
        .rejects.toThrow('User not found');
    });

    it('should throw an error if password is incorrect', async () => {
      // Mock bcrypt.compare to return false (password doesn't match)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('admin', 'wrongpassword'))
        .rejects.toThrow('Invalid password');
    });

    it('should return tokens if login is successful', async () => {
      // Mock bcrypt.compare to return true (password matches)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock jwt.sign for both token types
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, _options) => {
        if (secret === authService['JWT_SECRET']) {
          return 'test_access_token';
        } else {
          return 'test_refresh_token';
        }
      });

      const result = await authService.login('admin', 'admin123');

      expect(result).toEqual({
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        expiresIn: expect.any(Number),
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw an error if refresh token is invalid', async () => {
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid_token'))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw an error if user is not found', async () => {
      // Mock jwt.verify to return a decoded token with a non-existent user
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 999, // Non-existent user ID
        username: 'nonexistent',
        role: 'user',
      });

      await expect(authService.refreshToken('valid_token'))
        .rejects.toThrow('User not found');
    });

    it('should return new tokens if refresh token is valid', async () => {
      // Mock jwt.verify to return a decoded token with an existing user
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 1, // Existing user ID (admin)
        username: 'admin',
        role: 'admin',
      });

      // Mock jwt.sign for both token types
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, _options) => {
        if (secret === authService['JWT_SECRET']) {
          return 'new_access_token';
        } else {
          return 'new_refresh_token';
        }
      });

      const result = await authService.refreshToken('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: expect.any(Number),
      });
    });
  });

  describe('verifyToken', () => {
    it('should throw an error if token is invalid', () => {
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalid_token'))
        .toThrow('Invalid token');
    });

    it('should return decoded token payload if token is valid', () => {
      const mockPayload = {
        userId: 1,
        username: 'admin',
        role: 'admin',
      };

      // Mock jwt.verify to return a decoded token
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyToken('valid_token');

      expect(result).toEqual(mockPayload);
    });
  });
});

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthService } from '../../services/auth/auth-service.js';

// Mock jwt and bcrypt modules
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '3600';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '604800';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should return tokens for valid credentials', async () => {
      // Mock user data from database
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        roles: ['user'],
      };

      // Mock bcrypt compare to return true (valid password)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock JWT sign function
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, _options) => {
        if (secret === process.env.JWT_SECRET) return 'mock-access-token';
        if (secret === process.env.JWT_REFRESH_SECRET) return 'mock-refresh-token';
        return '';
      });

      // Mock findUserByUsername method
      authService.findUserByUsername = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.login('testuser', 'password');

      expect(authService.findUserByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 1, username: 'testuser', roles: ['user'] },
      });
    });

    test('should throw error for invalid username', async () => {
      // Mock findUserByUsername to return null (user not found)
      authService.findUserByUsername = jest.fn().mockResolvedValue(null);

      await expect(authService.login('nonexistent', 'password'))
        .rejects
        .toThrow('Invalid username or password');

      expect(authService.findUserByUsername).toHaveBeenCalledWith('nonexistent');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('should throw error for invalid password', async () => {
      // Mock user data from database
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        roles: ['user'],
      };

      // Mock findUserByUsername to return a user
      authService.findUserByUsername = jest.fn().mockResolvedValue(mockUser);

      // Mock bcrypt compare to return false (invalid password)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('testuser', 'wrongpassword'))
        .rejects
        .toThrow('Invalid username or password');

      expect(authService.findUserByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    test('should return decoded token for valid access token', () => {
      const mockDecodedToken = { userId: 1, username: 'testuser', roles: ['user'] };
      
      // Mock jwt verify function
      (jwt.verify as jest.Mock).mockImplementation(() => mockDecodedToken);

      const result = authService.verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(result).toEqual(mockDecodedToken);
    });

    test('should throw error for invalid token', () => {
      // Mock jwt verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalid-token'))
        .toThrow('Invalid token');

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET);
    });
  });

  describe('refreshToken', () => {
    test('should generate new access token from valid refresh token', () => {
      const mockDecodedRefreshToken = { userId: 1, username: 'testuser', roles: ['user'] };
      
      // Mock jwt verify function for refresh token
      (jwt.verify as jest.Mock).mockImplementation(() => mockDecodedRefreshToken);

      // Mock jwt sign function for new access token
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      const result = authService.refreshToken('valid-refresh-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', process.env.JWT_REFRESH_SECRET);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    test('should throw error for invalid refresh token', () => {
      // Mock jwt verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      expect(() => authService.refreshToken('invalid-refresh-token'))
        .toThrow('Invalid refresh token');

      expect(jwt.verify).toHaveBeenCalledWith('invalid-refresh-token', process.env.JWT_REFRESH_SECRET);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});

import { AuthService } from '../../services/auth/auth-service.js';

// Mock implementation to avoid dependencies on bcrypt and jwt
export class MockAuthService extends AuthService {
  constructor() {
    super();
  }

  async login(username: string, password: string) {
    if (username === 'testuser' && password === 'password') {
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };
    }
    throw new Error('Invalid credentials');
  }

  async refreshToken(refreshToken: string) {
    if (refreshToken === 'valid-refresh-token') {
      return {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
        expiresIn: 3600,
      };
    }
    throw new Error('Invalid refresh token');
  }

  verifyToken(token: string) {
    if (token === 'valid-token') {
      return {
        userId: 1,
        username: 'testuser',
        role: 'user',
      };
    }
    throw new Error('Invalid token');
  }
}

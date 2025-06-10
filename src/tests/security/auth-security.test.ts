import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/auth/auth-service.js';
import { AuthRoutes } from '../../controllers/auth/auth-routes.js';
import { ApiRateLimiter } from '../../controllers/api/api-rate-limiter.js';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '3600';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '604800';

describe('Auth Security Tests', () => {
  let app: express.Application;
  let authService: AuthService;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Create auth service with mock methods
    authService = new AuthService();
    
    // Mock login method
    authService.login = jest.fn().mockImplementation((username, password) => {
      if (username === 'validuser' && password === 'validpassword') {
        return Promise.resolve({
          accessToken: 'valid-access-token',
          refreshToken: 'valid-refresh-token',
          user: { id: 1, username: 'validuser', roles: ['user'] },
        });
      } else if (username === 'admin' && password === 'adminpassword') {
        return Promise.resolve({
          accessToken: 'valid-admin-token',
          refreshToken: 'valid-admin-refresh-token',
          user: { id: 2, username: 'admin', roles: ['admin'] },
        });
      } else {
        return Promise.reject(new Error('Invalid username or password'));
      }
    });
    
    // Mock verify token method
    authService.verifyToken = jest.fn().mockImplementation((token) => {
      if (token === 'valid-access-token') {
        return { userId: 1, username: 'validuser', roles: ['user'] };
      } else if (token === 'valid-admin-token') {
        return { userId: 2, username: 'admin', roles: ['admin'] };
      } else if (token === 'expired-token') {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      } else {
        throw new Error('Invalid token');
      }
    });
    
    // Mock refresh token method
    authService.refreshToken = jest.fn().mockImplementation((refreshToken) => {
      if (refreshToken === 'valid-refresh-token') {
        return { accessToken: 'new-access-token' };
      } else if (refreshToken === 'valid-admin-refresh-token') {
        return { accessToken: 'new-admin-access-token' };
      } else {
        throw new Error('Invalid refresh token');
      }
    });
    
    // Set up auth routes
    const authRoutes = new AuthRoutes();
    app.use('/auth', authRoutes.getRouter());
  });
  
  describe('Authentication Failures', () => {
    test('should return 401 for invalid login credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'invaliduser', password: 'invalidpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/auth/validate')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    test('should return 401 for expired token', async () => {
      const response = await request(app)
        .get('/auth/validate')
        .set('Authorization', 'Bearer expired-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token expired');
    });
  });
  
  describe('Authorization Security', () => {
    test('should return 403 for non-admin accessing admin route', async () => {
      const response = await request(app)
        .get('/auth/admin')
        .set('Authorization', 'Bearer valid-access-token');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });
    
    test('should allow admin to access admin route', async () => {
      const response = await request(app)
        .get('/auth/admin')
        .set('Authorization', 'Bearer valid-admin-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Admin access granted');
    });
  });
  
  describe('Token Security', () => {
    test('should not accept token in query parameters', async () => {
      const response = await request(app)
        .get('/auth/validate?token=valid-access-token');
      
      expect(response.status).toBe(401);
    });
    
    test('should accept token in authorization header', async () => {
      const response = await request(app)
        .get('/auth/validate')
        .set('Authorization', 'Bearer valid-access-token');
      
      expect(response.status).toBe(200);
    });
  });
});

describe('Rate Limiting Security', () => {
  let app: express.Application;
  let rateLimiter: ApiRateLimiter;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Configure rate limiter with restrictive settings for tests
    rateLimiter = new ApiRateLimiter({
      points: 3,               // Allow only 3 requests
      duration: 60,            // Per minute
      keyGenerator: (req) => req.ip || 'test-ip',
    });
    
    // Apply rate limiter to app
    app.use(rateLimiter.middleware());
    
    // Simple endpoint for testing
    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'Success' });
    });
  });
  
  test('should rate limit after specified number of requests', async () => {
    // First requests should succeed
    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    }
    
    // Next request should be rate limited
    const limitedResponse = await request(app).get('/test');
    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toHaveProperty('error', 'Too Many Requests');
  });
});

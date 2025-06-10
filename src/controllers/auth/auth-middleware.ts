import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth/auth-service.js';
import { logger } from '../../utils/logger.js';

// Extend Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      username: string;
      role: string;
    };
  }
}

/**
 * Authentication Middleware
 * Verifies JWT tokens in request headers
 */
export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Verify JWT token middleware
   */
  verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      // Check if authorization header has correct format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          success: false,
          message: 'Token format invalid',
        });
      }

      const token = parts[1];

      // Verify token
      const decoded = this.authService.verifyToken(token);

      // Attach user info to request
      req.user = decoded;

      // Proceed to next middleware
      next();
    } catch (error) {
      logger.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  };

  /**
   * Check admin role middleware
   */
  checkAdminRole = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required',
      });
    }

    next();
  };
}

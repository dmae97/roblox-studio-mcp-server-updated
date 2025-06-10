import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth-service.js';
import { logger } from '../../utils/logger.js';

/**
 * Authentication Controller
 * Handles authentication related requests
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login handler
   */
  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required', 
        });
      }

      const result = await this.authService.login(username, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  };

  /**
   * Token refresh handler
   */
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  };

  /**
   * Validate token handler
   */
  validateToken = async (_req: Request, res: Response) => {
    // If middleware passes, token is valid
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
    });
  };
}

import { Router } from 'express';
import { AuthController } from './auth-controller.js';
import { AuthMiddleware } from './auth-middleware.js';

/**
 * Authentication Routes
 */
export class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Login route
    this.router.post('/login', this.authController.login);

    // Refresh token route
    this.router.post('/refresh', this.authController.refreshToken);

    // Validate token route (protected route example)
    this.router.get(
      '/validate', 
      this.authMiddleware.verifyToken, 
      this.authController.validateToken,
    );

    // Admin-only route example
    this.router.get(
      '/admin',
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkAdminRole,
      (_req, res) => {
        res.status(200).json({
          success: true,
          message: 'Admin access granted',
        });
      },
    );
  }

  getRouter(): Router {
    return this.router;
  }
}

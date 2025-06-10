import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { logger } from '../../utils/logger.js';

// Mock user database (replace with actual database in production)
const USERS = [
  {
    id: 1,
    username: 'admin',
    // Hashed version of 'admin123'
    passwordHash: '$2b$10$3Xa0.8.3SsLUYM2a1sPuHu7Btty8BVb4b29JQ3ptQJBJvX.jAM3ce',
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    // Hashed version of 'user123'
    passwordHash: '$2b$10$0gXSS1Xj0ZfFVaF0B9AKIeKBqDU1kBRlhV9Xm3OnJQWJcW1wWn2QO',
    role: 'user',
  },
];

// Token types
interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication Service
 * Handles token generation and validation logic
 */
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: number;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_REFRESH_EXPIRES_IN: number;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
    this.JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || '3600', 10); // Default: 1 hour
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_here';
    this.JWT_REFRESH_EXPIRES_IN = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10); // Default: 1 week
  }

  /**
   * Login user and generate tokens
   */
  async login(username: string, password: string): Promise<TokenResult> {
    // Find user (replace with database lookup in production)
    const user = USERS.find(u => u.username === username);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;

      // Find user (replace with database lookup in production)
      const user = USERS.find(u => u.id === decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      logger.error(`Refresh token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify access token
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      logger.error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: typeof USERS[0]): TokenResult {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.JWT_EXPIRES_IN,
    };
  }
}

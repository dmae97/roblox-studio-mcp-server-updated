import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // Default: 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // Default: 100 requests

/**
 * Rate limiter middleware
 */
export const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Validate environment variables middleware
 * Ensures all required environment variables are set
 */
export const validateEnvVars = (req: Request, res: Response, next: NextFunction) => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.critical(errorMessage);
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
  }

  next();
};

/**
 * Cross-Origin Resource Sharing (CORS) configuration options
 */
export const corsOptions = {
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

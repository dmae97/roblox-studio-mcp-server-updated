import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Set default status code
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  // Determine error type for logging
  const errorType = statusCode >= 500 ? 'critical' : 'error';
  
  // Log the error
  if (errorType === 'critical') {
    logger.critical(`Error processing ${req.method} ${req.path}`, err);
  } else {
    logger.error(`${err.name}: ${err.message}`);
  }
  
  // Include stack trace in development, but not in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message,
      statusCode,
      ...(isDevelopment && err.stack ? { stack: err.stack } : {}),
    },
  });
}

/**
 * Not found middleware
 */
export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new ApiError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

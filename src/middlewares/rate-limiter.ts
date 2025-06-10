import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ApiError } from './error-handler.js';

/**
 * Simple in-memory rate limiter
 */

// Configuration
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // Default: 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // Default: 100 requests

// Store IP-based request counts
const requestCounts: Record<string, { count: number, resetTime: number }> = {};

/**
 * Clean up expired rate limit entries
 */
function cleanupExpired() {
  const now = Date.now();
  
  for (const key in requestCounts) {
    if (requestCounts[key].resetTime <= now) {
      delete requestCounts[key];
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupExpired, WINDOW_MS);

/**
 * Middleware to rate limit requests based on IP address
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Get client IP
  const ip = 
    (req.headers['x-forwarded-for'] as string)?.split(',').shift() || 
    req.socket.remoteAddress || 
    'unknown';
  
  const now = Date.now();
  
  // Initialize or reset if window expired
  if (!requestCounts[ip] || requestCounts[ip].resetTime <= now) {
    requestCounts[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
  }
  
  // Increment request count
  requestCounts[ip].count++;
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - requestCounts[ip].count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(requestCounts[ip].resetTime / 1000).toString());
  
  // Check if rate limit exceeded
  if (requestCounts[ip].count > MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    
    // Calculate retry-after in seconds
    const retryAfterSeconds = Math.ceil((requestCounts[ip].resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds.toString());
    
    throw new ApiError('Rate limit exceeded. Please try again later.', 429);
  }
  
  next();
}

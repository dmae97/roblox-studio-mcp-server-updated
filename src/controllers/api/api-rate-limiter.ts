import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../../utils/logger.js';

/**
 * API Rate Limiter Options
 */
export interface ApiRateLimiterOptions {
  /** Maximum number of points (requests) */
  points: number;
  /** Duration in seconds */
  duration: number;
  /** Block duration in seconds when limit exceeded */
  blockDuration?: number;
  /** Custom key generator function */
  keyGenerator?: (req: Request) => string;
  /** Skip rate limiting for certain requests */
  skip?: (req: Request) => boolean;
  /** Handler for when rate limit is exceeded */
  handler?: (req: Request, res: Response) => void;
}

/**
 * API Rate Limiter middleware
 * Advanced rate limiting with flexible configuration
 */
export class ApiRateLimiter {
  private limiter: RateLimiterMemory;
  private options: ApiRateLimiterOptions;

  constructor(options: ApiRateLimiterOptions) {
    this.options = {
      blockDuration: 0,
      keyGenerator: (req) => req.ip || 'unknown',
      skip: () => false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later',
        });
      },
      ...options,
    };

    this.limiter = new RateLimiterMemory({
      points: this.options.points,
      duration: this.options.duration,
      blockDuration: this.options.blockDuration,
    });

    logger.info(`API Rate limiter initialized: ${this.options.points} requests per ${this.options.duration}s`);
  }

  /**
   * Create Express middleware
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip rate limiting if specified
      if (this.options.skip && this.options.skip(req)) {
        return next();
      }

      // Generate key for this request
      const key = this.options.keyGenerator!(req);

      try {
        // Try to consume a point
        const rateLimiterRes = await this.limiter.consume(key);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', this.options.points);
        res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());

        next();
      } catch (error) {
        // Rate limit exceeded
        if (error instanceof Error && 'remainingPoints' in error) {
          const rateLimiterRes = error as any;

          // Set rate limit headers
          res.setHeader('X-RateLimit-Limit', this.options.points);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
          res.setHeader('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000));

          logger.warn(`Rate limit exceeded for ${key}`);

          // Call the handler
          if (this.options.handler) {
            return this.options.handler(req, res);
          }
        }

        // For any other error, pass to the next middleware
        next(error);
      }
    };
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(key: string) {
    try {
      const res = await this.limiter.get(key);
      return {
        consumedPoints: res?.consumedPoints || 0,
        remainingPoints: this.options.points - (res?.consumedPoints || 0),
        isBlocked: false,
        msBeforeNext: res?.msBeforeNext || 0,
      };
    } catch (error) {
      if (error instanceof Error && 'msBeforeNext' in error) {
        const rateLimiterRes = error as any;
        return {
          consumedPoints: this.options.points,
          remainingPoints: 0,
          isBlocked: true,
          msBeforeNext: rateLimiterRes.msBeforeNext,
        };
      }
      throw error;
    }
  }

  /**
   * Reset rate limit for a key
   */
  async reset(key: string) {
    return this.limiter.delete(key);
  }

  /**
   * Reset all rate limits
   */
  async resetAll() {
    // Note: deleteAll method may not be available in some versions
    // This is a fallback implementation
    try {
      return (this.limiter as any).deleteAll();
    } catch {
      logger.warn('deleteAll method not available on rate limiter');
      return Promise.resolve();
    }
  }
}

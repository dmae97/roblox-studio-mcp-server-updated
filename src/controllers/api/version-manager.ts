import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';

// Interface for API version definition
export interface ApiVersion {
  version: string;
  router: Router;
  deprecated?: boolean;
  endOfLife?: Date;
}

// API version not found error
export class ApiVersionNotFoundError extends Error {
  constructor(version: string) {
    super(`API version '${version}' not found`);
    this.name = 'ApiVersionNotFoundError';
  }
}

/**
 * API Version Manager
 * Handles API versioning and routing to the correct version handlers
 */
export class ApiVersionManager {
  private versions: Map<string, ApiVersion>;
  private defaultVersion: string;

  constructor(defaultVersion: string = 'v1') {
    this.versions = new Map();
    this.defaultVersion = defaultVersion;
  }

  /**
   * Register a new API version
   */
  registerVersion(version: ApiVersion): void {
    this.versions.set(version.version, version);
    logger.info(`API version ${version.version} registered${version.deprecated ? ' (deprecated)' : ''}`);
  }

  /**
   * Get an API version by name
   */
  getVersion(version: string): ApiVersion {
    const apiVersion = this.versions.get(version);
    if (!apiVersion) {
      throw new ApiVersionNotFoundError(version);
    }
    return apiVersion;
  }

  /**
   * Mark an API version as deprecated
   */
  deprecateVersion(version: string, endOfLife?: Date): void {
    const apiVersion = this.getVersion(version);
    apiVersion.deprecated = true;
    if (endOfLife) {
      apiVersion.endOfLife = endOfLife;
    }
    logger.info(`API version ${version} marked as deprecated${endOfLife ? ` (EOL: ${endOfLife.toISOString()})` : ''}`);
  }

  /**
   * Remove an API version
   */
  removeVersion(version: string): void {
    if (this.versions.has(version)) {
      this.versions.delete(version);
      logger.info(`API version ${version} removed`);
    }
  }

  /**
   * Get all registered API versions
   */
  getAllVersions(): ApiVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Set the default API version
   */
  setDefaultVersion(version: string): void {
    if (!this.versions.has(version)) {
      throw new ApiVersionNotFoundError(version);
    }
    this.defaultVersion = version;
    logger.info(`Default API version set to ${version}`);
  }

  /**
   * Get the default API version
   */
  getDefaultVersion(): string {
    return this.defaultVersion;
  }

  /**
   * Create middleware to route requests to the appropriate API version
   */
  createVersioningMiddleware(): Router {
    const router = Router();

    // Version info endpoint
    router.get('/versions', (_req: Request, res: Response) => {
      const versions = this.getAllVersions().map(v => ({
        version: v.version,
        deprecated: !!v.deprecated,
        endOfLife: v.endOfLife ? v.endOfLife.toISOString() : undefined,
        default: v.version === this.defaultVersion,
      }));

      res.json({
        success: true,
        data: {
          versions,
          default: this.defaultVersion,
        },
      });
    });

    // Route to specific version
    router.use('/v:version', (req: Request, res: Response, next: NextFunction) => {
      const version = req.params.version;
      
      try {
        const apiVersion = this.getVersion(`v${version}`);
        
        // Check if version is deprecated and add deprecation header
        if (apiVersion.deprecated) {
          res.setHeader('X-API-Deprecated', 'true');
          
          if (apiVersion.endOfLife) {
            res.setHeader('X-API-End-Of-Life', apiVersion.endOfLife.toISOString());
          }
        }
        
        // Route to the version's router
        apiVersion.router(req, res, next);
      } catch (error) {
        if (error instanceof ApiVersionNotFoundError) {
          res.status(404).json({
            success: false,
            error: error.message,
          });
        } else {
          next(error);
        }
      }
    });

    // Default version route
    router.use('/', (req: Request, res: Response, next: NextFunction) => {
      try {
        const defaultApiVersion = this.getVersion(this.defaultVersion);
        
        // Add header indicating the version that was used
        res.setHeader('X-API-Version', this.defaultVersion);
        
        if (defaultApiVersion.deprecated) {
          res.setHeader('X-API-Deprecated', 'true');
          
          if (defaultApiVersion.endOfLife) {
            res.setHeader('X-API-End-Of-Life', defaultApiVersion.endOfLife.toISOString());
          }
        }
        
        defaultApiVersion.router(req, res, next);
      } catch (error) {
        next(error);
      }
    });

    return router;
  }
}

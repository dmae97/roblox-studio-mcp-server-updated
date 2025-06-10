import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import dotenv from 'dotenv';
import { robloxTools } from './tools/index.js';
import { robloxResources } from './resources/index.js';
import { robloxPrompts } from './prompts/index.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFound, ApiError } from './middlewares/error-handler.js';
import { ApiRateLimiter } from './controllers/api/api-rate-limiter.js';
import { validateEnvVars } from './middlewares/security.js';
import { ConnectionManager } from './connection/connection-manager.js';
import { WebSocketHandler } from './controllers/api/websocket-handler.js';
import { ApiVersionManager } from './controllers/api/version-manager.js';
import { cache } from './utils/cache.js';
import { AuthRoutes } from './controllers/auth/auth-routes.js';
import { metricsMiddleware, getMetrics } from './middlewares/metrics.js';
import { setupSwagger } from '../swagger.js';

// Load environment variables
dotenv.config();

// Server configuration
const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || 'Roblox Studio MCP Server';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';
const DEBUG = process.env.DEBUG === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_RATE_LIMITING = process.env.ENABLE_RATE_LIMITING !== 'false';

// Create MCP Server
const mcpServer = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Register tools, resources, and prompts
robloxTools.register(mcpServer);
robloxResources.register(mcpServer);
robloxPrompts.register(mcpServer);

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create connection manager
const connectionManager = new ConnectionManager();

// Create WebSocket handler
const wsHandler = new WebSocketHandler(server, mcpServer, connectionManager);

// Create API version manager
const apiVersionManager = new ApiVersionManager();

// Register API version v1
const v1Router = express.Router();
v1Router.use('/auth', new AuthRoutes().getRouter());
apiVersionManager.registerVersion({ version: 'v1', router: v1Router });

// Set default API version
apiVersionManager.setDefaultVersion('v1');

// Middleware
app.use(helmet()); // Adds various HTTP security headers
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS?.split(','),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(validateEnvVars);
app.use(metricsMiddleware);

// Set up Swagger API documentation
setupSwagger(app);

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  
  next();
});

// Apply rate limiting if enabled
if (ENABLE_RATE_LIMITING) {
  logger.info('Rate limiting enabled');
  
  const apiRateLimiter = new ApiRateLimiter({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10) / 1000,
    keyGenerator: (req) => req.ip || 'unknown',
    skip: (req) => req.path === '/health', // Skip rate limiting for health checks
  });
  
  app.use(apiRateLimiter.middleware());
}

// SSE endpoint
app.get('/sse', async (req, res, next) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    
    // Register with connection manager
    connectionManager.registerConnection(transport.sessionId, transport);
    
    logger.info(`New SSE connection established: ${transport.sessionId}`);
    
    res.on('close', () => {
      logger.info(`SSE connection closed: ${transport.sessionId}`);
      connectionManager.unregisterConnection(transport.sessionId);
    });
    
    await mcpServer.connect(transport);
  } catch (error) {
    next(error);
  }
});

// Messages endpoint
app.post('/messages', async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId as string;
    
    if (!sessionId) {
      throw new ApiError('Missing sessionId parameter', 400);
    }
    
    const transport = connectionManager.getConnection(sessionId);
    
    // Update connection activity
    connectionManager.updateActivity(sessionId);
    
    // Generate request ID for tracking
    const requestId = `${sessionId}-${Date.now()}`;
    connectionManager.startRequestTimer(requestId);
    
    if (transport) {
      if (transport instanceof SSEServerTransport) {
        if (transport.handlePostMessage) {
          await transport.handlePostMessage(req, res, () => {});
        }
      } else {
        throw new ApiError('Invalid transport type for this endpoint', 400);
      }
      
      // End request timer
      connectionManager.endRequestTimer(requestId);
    } else {
      throw new ApiError(`No transport found for sessionId: ${sessionId}`, 400);
    }
  } catch (error) {
    next(error);
  }
});

// API routes (with versioning)
app.use('/api', apiVersionManager.createVersioningMiddleware());

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    name: SERVER_NAME,
    version: SERVER_VERSION,
    environment: NODE_ENV,
    connections: {
      sse: connectionManager.getConnectionCount(),
      websocket: wsHandler.getConnectionCount(),
      total: connectionManager.getConnectionCount() + wsHandler.getConnectionCount(),
    },
  });
});

// Metrics endpoint
app.get('/metrics', (_, res) => {
  const uptime = Math.floor(process.uptime());
  
  res.status(200).json({
    server: {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      environment: NODE_ENV,
      uptime,
      uptime_formatted: formatUptime(uptime),
    },
    connections: connectionManager.getStats(),
    metrics: getMetrics(),
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
    cache: {
      stats: cache.stats(),
      keys: cache.keys().length,
    },
  });
});

// Add error handling middleware
app.use(notFound);
app.use(errorHandler);

// Format uptime helper
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  
  return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
}

// Start server
const serverInstance = server.listen(PORT, () => {
  logger.info(`${SERVER_NAME} v${SERVER_VERSION} running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  if (DEBUG) {
    logger.info('Debug mode enabled');
  }
  logger.info(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
  logger.info(`SSE endpoint available at http://localhost:${PORT}/sse`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Enable graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Graceful shutdown function
async function gracefulShutdown() {
  logger.info('Server shutting down gracefully...');
  
  try {
    // Close WebSocket connections
    await wsHandler.close();
    logger.info('WebSocket server closed');
    
    // Clean up connection manager
    connectionManager.cleanup();
    logger.info('Connection manager cleaned up');
    
    // Close server
    await new Promise<void>((resolve, reject) => {
      serverInstance.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    logger.info('HTTP server closed');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
  
  // If server doesn't close in 10 seconds, force exit
  setTimeout(() => {
    logger.error('Server shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.critical('Uncaught exception', error);
  // Give the logger time to log the error before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.critical('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

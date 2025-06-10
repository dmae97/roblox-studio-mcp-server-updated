import { serve, setup } from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import type { Express } from 'express';

/**
 * Swagger/OpenAPI configuration options
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Roblox Studio MCP Server API',
      version: process.env.SERVER_VERSION || '1.0.0',
      description: 'API documentation for the Roblox Studio MCP Server',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        url: 'https://github.com/dmae97/roblox-studio-mcp-server-updated',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [
    './src/controllers/auth/*.ts',
    './src/controllers/api/*.ts',
    './src/middlewares/*.ts',
    './src/routes/*.ts',
  ],
};

/**
 * Setup Swagger documentation routes
 * @param {Express.Application} app - Express application instance
 */
export function setupSwagger(app: Express) {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
    const specs = swaggerJsdoc(options);
    app.use('/api-docs', serve, setup(specs));
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });
    // API Documentation available at /api-docs
  }
}

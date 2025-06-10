import request from 'supertest';
import express from 'express';
import http from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { robloxTools } from '../tools/index.js';
import { robloxResources } from '../resources/index.js';
import { robloxPrompts } from '../prompts/index.js';
import { errorHandler, notFound } from '../middlewares/error-handler.js';
import { metricsMiddleware } from '../middlewares/metrics.js';

describe('E2E Server Tests', () => {
  let app: express.Application;
  let server: http.Server;
  
  beforeAll(() => {
    // Create MCP Server
    const mcpServer = new McpServer({
      name: 'E2E Test Server',
      version: '1.0.0-test',
    });
    
    // Register tools, resources, and prompts
    robloxTools.register(mcpServer);
    robloxResources.register(mcpServer);
    robloxPrompts.register(mcpServer);
    
    // Create Express app
    app = express();
    
    // Add middleware
    app.use(express.json());
    app.use(metricsMiddleware);
    
    // Add health check endpoint
    app.get('/health', (_, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Add error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Create HTTP server
    server = http.createServer(app);
  });
  
  afterAll((done) => {
    server.close(done);
  });
  
  test('Health endpoint should return 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
  
  test('Non-existent endpoint should return 404 status', async () => {
    const response = await request(app).get('/non-existent-path');
    expect(response.status).toBe(404);
  });
});

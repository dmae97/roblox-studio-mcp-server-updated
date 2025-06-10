// Jest setup file
// This file is loaded after the Jest environment is set up but before the tests start

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SERVER_NAME = 'MCP Test Server';
process.env.SERVER_VERSION = '1.0.0-test';
process.env.PORT = '3001';
process.env.DEBUG = 'false';
process.env.ENABLE_RATE_LIMITING = 'false';
process.env.JWT_SECRET = 'test-secret-key';
process.env.CORS_ORIGINS = '*';
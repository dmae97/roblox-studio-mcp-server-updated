import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

// Placeholder for future resource implementations
const documentation = {
  register: (_server: McpServer) => {
    logger.debug('Documentation resource placeholder');
  },
};

const templates = {
  register: (_server: McpServer) => {
    logger.debug('Templates resource placeholder');
  },
};

/**
 * Registry for all Roblox Studio resources
 */
export const robloxResources = {
  register: (server: McpServer) => {
    logger.info('Registering Roblox Studio resources...');
    
    // Register all resources
    documentation.register(server);
    templates.register(server);
    
    logger.info('Roblox Studio resources registered successfully');
  },
};

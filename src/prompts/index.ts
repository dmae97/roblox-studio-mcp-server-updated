import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

// Placeholder for future prompt implementations
const scriptGenerator = {
  register: (_server: McpServer) => {
    logger.debug('ScriptGenerator prompt placeholder');
  },
};

const bugFinder = {
  register: (_server: McpServer) => {
    logger.debug('BugFinder prompt placeholder');
  },
};

/**
 * Registry for all Roblox Studio prompts
 */
export const robloxPrompts = {
  register: (server: McpServer) => {
    logger.info('Registering Roblox Studio prompts...');
    
    // Register all prompts
    scriptGenerator.register(server);
    bugFinder.register(server);
    
    logger.info('Roblox Studio prompts registered successfully');
  },
};

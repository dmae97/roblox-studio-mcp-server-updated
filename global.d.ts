/// <reference types="node" />

/**
 * Type definitions for MCP SDK
 */
declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export class McpServer {
    constructor(serverInfo: any, options?: any);
    connect(transport: any): Promise<void>;
    addTool(tool: {
      name: string;
      description: string;
      inputSchema: any;
      handler: (args: Record<string, unknown>) => Promise<any>;
    }): void;
    addPrompt(prompt: {
      name: string;
      description: string;
      arguments?: any[];
      handler: (args: Record<string, unknown>) => Promise<string>;
    }): void;
    // Add other methods as needed
  }
  
  export interface McpMessage {
    // Define message structure
    [key: string]: any;
  }
  
  export const ResourceTemplate: any;
}

declare module '@modelcontextprotocol/sdk/server/sse.js' {
  export class SSEServerTransport {
    sessionId: string;
    constructor(...args: any[]);
    handlePostMessage?: (req: any, res: any, next: any) => void;
    // Add methods as needed
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  }

  export interface Prompt {
    name: string;
    description: string;
    arguments?: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  }
}


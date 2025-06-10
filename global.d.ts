/// <reference types="node" />

/**
 * Type definitions for MCP SDK
 */
declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export class McpServer {
    constructor(serverInfo: any, options?: any);
    connect(transport: any): Promise<void>;
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


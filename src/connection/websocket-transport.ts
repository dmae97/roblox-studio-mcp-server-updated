import WebSocket from 'ws';
import { McpMessage } from '@modelcontextprotocol/sdk/server/mcp.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * WebSocket Server Transport for MCP
 * Implements an alternative transport mechanism for MCP using WebSockets
 * Provides better real-time communication compared to SSE
 */
export class WebSocketServerTransport {
  readonly sessionId: string;
  private socket: WebSocket;
  private pingInterval?: NodeJS.Timeout;
  private missedPings: number = 0;
  private readonly maxMissedPings: number = 3;
  private onCloseHandlers: Array<() => void> = [];
  private onMessageHandlers: Array<(message: McpMessage) => void> = [];

  constructor(socket: WebSocket) {
    this.sessionId = uuidv4();
    this.socket = socket;
    
    this.setupSocket();
    this.startPingInterval();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocket(): void {
    this.socket.on('message', (message: WebSocket.Data) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as McpMessage;
        for (const handler of this.onMessageHandlers) {
          handler(parsedMessage);
        }
      } catch (error) {
        logger.error(`Failed to parse WebSocket message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    this.socket.on('close', () => {
      this.cleanup();
      for (const handler of this.onCloseHandlers) {
        handler();
      }
    });

    this.socket.on('error', (error) => {
      logger.error(`WebSocket error for session ${this.sessionId}: ${error.message}`);
    });

    this.socket.on('pong', () => {
      this.missedPings = 0; // Reset missed pings counter on pong
    });
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        // Increment missed pings counter before sending ping
        this.missedPings++;
        
        // If we've missed too many pings, close the connection
        if (this.missedPings > this.maxMissedPings) {
          logger.warn(`WebSocket session ${this.sessionId} missed ${this.missedPings} pings, closing connection`);
          this.socket.terminate();
          this.cleanup();
          return;
        }
        
        // Send ping
        this.socket.ping();
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  /**
   * Send a message to the client
   */
  async sendMessage(message: McpMessage): Promise<void> {
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection is not open');
    }

    return new Promise((resolve, reject) => {
      this.socket.send(JSON.stringify(message), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Register a handler for incoming messages
   */
  onMessage(handler: (message: McpMessage) => void): void {
    this.onMessageHandlers.push(handler);
  }

  /**
   * Register a handler for connection close
   */
  onClose(handler: () => void): void {
    this.onCloseHandlers.push(handler);
  }

  /**
   * Check if the connection is healthy
   */
  isHealthy(): boolean {
    return this.socket.readyState === WebSocket.OPEN && this.missedPings <= this.maxMissedPings;
  }

  /**
   * Close the connection
   */
  close(): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.cleanup();
  }
}

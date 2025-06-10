import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { WebSocketServerTransport } from './websocket-transport.js';
import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

export type Transport = SSEServerTransport | WebSocketServerTransport;
export type TransportType = 'sse' | 'websocket';

interface ConnectionStats {
  connected: number;
  disconnected: number;
  reconnected: number;
  failed: number;
  avgResponseTime: number;
  totalRequests: number;
}

/**
 * Connection Manager
 * Manages all active MCP connections and provides statistics and health monitoring
 */
export class ConnectionManager extends EventEmitter {
  private connections: Map<string, Transport>;
  private stats: ConnectionStats;
  private pingIntervalId?: NodeJS.Timeout;
  private healthCheckIntervalMs: number;
  private connectionTimeouts: Map<string, NodeJS.Timeout>;
  private lastActivity: Map<string, number>;
  private responseTimers: Map<string, number>;

  constructor(healthCheckIntervalMs = 30000) { // Default: Check every 30 seconds
    super();
    this.connections = new Map();
    this.connectionTimeouts = new Map();
    this.lastActivity = new Map();
    this.responseTimers = new Map();
    this.healthCheckIntervalMs = healthCheckIntervalMs;
    this.stats = {
      connected: 0,
      disconnected: 0,
      reconnected: 0,
      failed: 0,
      avgResponseTime: 0,
      totalRequests: 0,
    };

    // Start health check interval
    this.startHealthCheck();
  }

  /**
   * Register a new connection
   */
  registerConnection(sessionId: string, transport: Transport): void {
    this.connections.set(sessionId, transport);
    this.lastActivity.set(sessionId, Date.now());
    this.stats.connected++;
    
    logger.info(`Connection registered: ${sessionId} (${transport.constructor.name})`);
    
    this.emit('connection', { sessionId, type: transport.constructor.name });
  }

  /**
   * Unregister a connection
   */
  unregisterConnection(sessionId: string): void {
    if (this.connections.has(sessionId)) {
      this.connections.delete(sessionId);
      this.lastActivity.delete(sessionId);
      this.clearTimeout(sessionId);
      this.stats.disconnected++;
      
      logger.info(`Connection unregistered: ${sessionId}`);
      
      this.emit('disconnection', { sessionId });
    }
  }

  /**
   * Get a connection by session ID
   */
  getConnection(sessionId: string): Transport | undefined {
    return this.connections.get(sessionId);
  }

  /**
   * Check if a connection exists
   */
  hasConnection(sessionId: string): boolean {
    return this.connections.has(sessionId);
  }

  /**
   * Get all active connections
   */
  getAllConnections(): Map<string, Transport> {
    return this.connections;
  }

  /**
   * Get the number of active connections
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Update the last activity timestamp for a connection
   */
  updateActivity(sessionId: string): void {
    if (this.connections.has(sessionId)) {
      this.lastActivity.set(sessionId, Date.now());
      this.clearTimeout(sessionId);
    }
  }

  /**
   * Start timing a request
   */
  startRequestTimer(requestId: string): void {
    this.responseTimers.set(requestId, Date.now());
  }

  /**
   * End timing a request and update stats
   */
  endRequestTimer(requestId: string): void {
    const startTime = this.responseTimers.get(requestId);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.responseTimers.delete(requestId);
      
      // Update average response time
      this.stats.totalRequests++;
      this.stats.avgResponseTime = (
        (this.stats.avgResponseTime * (this.stats.totalRequests - 1)) + duration
      ) / this.stats.totalRequests;
    }
  }

  /**
   * Set a timeout for a connection
   */
  setTimeout(sessionId: string, timeoutMs: number): void {
    this.clearTimeout(sessionId);
    
    const timeoutId = setTimeout(() => {
      logger.warn(`Connection timeout: ${sessionId} (inactive for ${timeoutMs}ms)`);
      this.unregisterConnection(sessionId);
      this.stats.failed++;
      
      this.emit('timeout', { sessionId });
    }, timeoutMs);
    
    this.connectionTimeouts.set(sessionId, timeoutId);
  }

  /**
   * Clear a timeout for a connection
   */
  clearTimeout(sessionId: string): void {
    const timeoutId = this.connectionTimeouts.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.connectionTimeouts.delete(sessionId);
    }
  }

  /**
   * Get current connection statistics
   */
  getStats(): ConnectionStats & { current: number } {
    return {
      ...this.stats,
      current: this.connections.size,
    };
  }

  /**
   * Start the health check interval
   */
  private startHealthCheck(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }
    
    this.pingIntervalId = setInterval(() => {
      this.checkConnectionHealth();
    }, this.healthCheckIntervalMs);
    
    logger.info(`Connection health check started (interval: ${this.healthCheckIntervalMs}ms)`);
  }

  /**
   * Check connection health
   */
  private checkConnectionHealth(): void {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [sessionId, lastActivityTime] of this.lastActivity.entries()) {
      const inactiveDuration = now - lastActivityTime;
      
      if (inactiveDuration > inactiveThreshold) {
        logger.warn(`Connection inactive: ${sessionId} (inactive for ${Math.floor(inactiveDuration / 1000)}s)`);
        this.emit('inactive', { sessionId, inactiveDuration });
        
        // Set a timeout to close the connection if still inactive
        this.setTimeout(sessionId, 60000); // Close after 1 more minute of inactivity
      }
    }
  }

  /**
   * Stop the health check interval
   */
  stopHealthCheck(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = undefined;
      logger.info('Connection health check stopped');
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopHealthCheck();
    
    // Clear all timeouts
    for (const timeoutId of this.connectionTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    
    this.connectionTimeouts.clear();
    this.connections.clear();
    this.lastActivity.clear();
    this.responseTimers.clear();
    
    logger.info('Connection manager cleaned up');
  }
}

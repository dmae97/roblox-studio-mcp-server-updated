import { ConnectionManager, Transport } from '../../connection/connection-manager.js';

// Mock Transport class
class MockTransport {
  sessionId: string;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
}

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  let mockTransport: Transport;

  beforeEach(() => {
    // Create a new ConnectionManager instance for each test
    connectionManager = new ConnectionManager(100); // Use a short health check interval for testing
    mockTransport = new MockTransport('test-session-id') as unknown as Transport;
  });

  afterEach(() => {
    // Clean up after each test
    connectionManager.cleanup();
  });

  test('should register a connection', () => {
    connectionManager.registerConnection(mockTransport.sessionId, mockTransport);
    expect(connectionManager.hasConnection(mockTransport.sessionId)).toBe(true);
    expect(connectionManager.getConnectionCount()).toBe(1);
  });

  test('should retrieve a connection by session ID', () => {
    connectionManager.registerConnection(mockTransport.sessionId, mockTransport);
    const retrievedTransport = connectionManager.getConnection(mockTransport.sessionId);
    expect(retrievedTransport).toBe(mockTransport);
  });

  test('should unregister a connection', () => {
    connectionManager.registerConnection(mockTransport.sessionId, mockTransport);
    connectionManager.unregisterConnection(mockTransport.sessionId);
    expect(connectionManager.hasConnection(mockTransport.sessionId)).toBe(false);
    expect(connectionManager.getConnectionCount()).toBe(0);
  });

  test('should update activity for a connection', () => {
    connectionManager.registerConnection(mockTransport.sessionId, mockTransport);
    const initialActivity = connectionManager['lastActivity'].get(mockTransport.sessionId);
    
    // Wait a short time before updating activity
    setTimeout(() => {
      connectionManager.updateActivity(mockTransport.sessionId);
      const updatedActivity = connectionManager['lastActivity'].get(mockTransport.sessionId);
      expect(updatedActivity).toBeGreaterThan(initialActivity!);
    }, 10);
  });

  test('should track request timing', () => {
    const requestId = 'test-request-id';
    connectionManager.startRequestTimer(requestId);
    expect(connectionManager['responseTimers'].has(requestId)).toBe(true);
    
    connectionManager.endRequestTimer(requestId);
    expect(connectionManager['responseTimers'].has(requestId)).toBe(false);
    
    // Stats should be updated
    const stats = connectionManager.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.avgResponseTime).toBeGreaterThanOrEqual(0);
  });

  test('should get connection statistics', () => {
    connectionManager.registerConnection('session1', mockTransport);
    connectionManager.registerConnection('session2', mockTransport);
    connectionManager.unregisterConnection('session2');
    
    const stats = connectionManager.getStats();
    expect(stats.connected).toBe(2);
    expect(stats.disconnected).toBe(1);
    expect(stats.current).toBe(1);
  });
});

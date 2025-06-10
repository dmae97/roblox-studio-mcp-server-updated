import WebSocket from 'ws';
import { WebSocketServerTransport } from '../../connection/websocket-transport.js';
import { McpMessage } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EventEmitter } from 'events';

// Mock WebSocket class
class MockWebSocket extends EventEmitter {
  readyState = WebSocket.OPEN;
  
  send(data: string, callback?: (err?: Error) => void) {
    if (callback) callback();
    return true;
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
  }
  
  terminate() {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
  }
  
  ping() {
    this.emit('pong');
    return true;
  }
}

describe('WebSocketServerTransport', () => {
  let mockSocket: MockWebSocket;
  let transport: WebSocketServerTransport;
  
  beforeEach(() => {
    mockSocket = new MockWebSocket();
    transport = new WebSocketServerTransport(mockSocket as unknown as WebSocket);
  });
  
  test('should generate a sessionId', () => {
    expect(transport.sessionId).toBeDefined();
    expect(typeof transport.sessionId).toBe('string');
  });
  
  test('should handle message sending', async () => {
    const sendSpy = jest.spyOn(mockSocket, 'send');
    const message: McpMessage = {
      id: '1',
      role: 'user',
      content: 'test message',
      created_at: new Date().toISOString(),
    };
    
    await transport.sendMessage(message);
    
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message), expect.any(Function));
  });
  
  test('should register and call message handlers', () => {
    const handler = jest.fn();
    const message: McpMessage = {
      id: '1',
      role: 'user',
      content: 'test message',
      created_at: new Date().toISOString(),
    };
    
    transport.onMessage(handler);
    mockSocket.emit('message', JSON.stringify(message));
    
    expect(handler).toHaveBeenCalledWith(message);
  });
  
  test('should register and call close handlers', () => {
    const handler = jest.fn();
    
    transport.onClose(handler);
    mockSocket.emit('close');
    
    expect(handler).toHaveBeenCalled();
  });
  
  test('should check if connection is healthy', () => {
    expect(transport.isHealthy()).toBe(true);
    
    // Simulate closed connection
    mockSocket.readyState = WebSocket.CLOSED;
    expect(transport.isHealthy()).toBe(false);
  });
  
  test('should close the connection', () => {
    const closeSpy = jest.spyOn(mockSocket, 'close');
    
    transport.close();
    
    expect(closeSpy).toHaveBeenCalled();
  });
});

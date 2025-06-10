/**
 * Example WebSocket client for connecting to the Roblox Studio MCP Server
 * 
 * This example shows how to establish a WebSocket connection, send messages,
 * and handle responses from the MCP server.
 */

// WebSocket URL (adjust host/port as needed)
const WS_URL = 'ws://localhost:3000/ws';

class RobloxMcpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.sessionId = null;
    this.messageId = 0;
    this.callbacks = new Map();
    this.onOpenCallbacks = [];
    this.onCloseCallbacks = [];
    this.onErrorCallbacks = [];
    this.autoReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second, will increase exponentially
  }

  /**
   * Connect to the MCP server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = (event) => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.onOpenCallbacks.forEach(callback => callback(event));
          resolve(event);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.onCloseCallbacks.forEach(callback => callback(event));
          
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.onErrorCallbacks.forEach(callback => callback(event));
          reject(event);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1} of ${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  /**
   * Send a message to the MCP server
   */
  sendMessage(type, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket connection not open'));
        return;
      }

      const messageId = this.getNextMessageId();
      const message = {
        id: messageId,
        type,
        data
      };

      // Set up callback for response
      this.callbacks.set(messageId, { resolve, reject });

      // Send the message
      this.socket.send(JSON.stringify(message));
    });
  }

  /**
   * Handle incoming messages from the server
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message);

      // Check if this is a response to a previous message
      if (message.id && this.callbacks.has(message.id)) {
        const { resolve } = this.callbacks.get(message.id);
        resolve(message);
        this.callbacks.delete(message.id);
      }

      // Handle session ID assigned by server
      if (message.type === 'session' && message.data && message.data.sessionId) {
        this.sessionId = message.data.sessionId;
        console.log(`Session ID assigned: ${this.sessionId}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  /**
   * Get the next message ID
   */
  getNextMessageId() {
    return `msg_${++this.messageId}`;
  }

  /**
   * Register a callback for when the connection opens
   */
  onOpen(callback) {
    this.onOpenCallbacks.push(callback);
  }

  /**
   * Register a callback for when the connection closes
   */
  onClose(callback) {
    this.onCloseCallbacks.push(callback);
  }

  /**
   * Register a callback for when an error occurs
   */
  onError(callback) {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Close the connection
   */
  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.autoReconnect = false; // Disable auto-reconnect
      this.socket.close();
    }
  }

  /**
   * Use MCP tool
   */
  async useTool(toolName, params = {}) {
    return this.sendMessage('tool', {
      tool: toolName,
      params
    });
  }

  /**
   * Access MCP resource
   */
  async getResource(resourcePath) {
    return this.sendMessage('resource', {
      resource: resourcePath
    });
  }

  /**
   * Use MCP prompt
   */
  async usePrompt(promptName, params = {}) {
    return this.sendMessage('prompt', {
      prompt: promptName,
      params
    });
  }
}

// Example usage:
/*
const client = new RobloxMcpClient(WS_URL);

// Connect to the server
client.connect().then(() => {
  console.log('Connected to MCP server');
  
  // Use a tool
  client.useTool('generate-roblox-code', {
    scriptType: 'ServerScript',
    functionality: 'Handle player movement',
    includeComments: true
  }).then(response => {
    console.log('Tool response:', response);
  }).catch(error => {
    console.error('Tool error:', error);
  });
  
}).catch(error => {
  console.error('Connection error:', error);
});
*/

#!/usr/bin/env node

// Minimal MCP Server using stdio
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Send notification
function notify(method, params = {}) {
  console.log(JSON.stringify({
    jsonrpc: '2.0',
    method,
    params
  }));
}

// Handle JSON-RPC requests
rl.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    const response = handleRequest(request);
    if (response) {
      console.log(JSON.stringify(response));
    }
  } catch (error) {
    console.error('Parse error:', error);
  }
});

function handleRequest(request) {
  const { method, params, id } = request;
  
  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          serverInfo: {
            name: 'roblox-mcp',
            version: '1.0.0'
          }
        }
      };
      
    case 'initialized':
      // Client has initialized, no response needed
      return null;
      
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: []
        }
      };
      
    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: []
        }
      };
      
    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: []
        }
      };
      
    case 'ping':
      return {
        jsonrpc: '2.0',
        id,
        result: {}
      };
      
    default:
      if (id !== undefined) {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
      }
      return null;
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
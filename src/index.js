// Pure Node.js MCP Server - No dependencies
const http = require('http');

const PORT = process.env.PORT || 3000;

// MCP JSON-RPC handler
function handleJsonRpc(body) {
  const { method, params, id } = body;
  
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
            name: 'roblox-mcp-server',
            version: '2.0.0'
          }
        }
      };
      
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: [] }
      };
      
    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { resources: [] }
      };
      
    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { prompts: [] }
      };
      
    default:
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      };
  }
}

// Create server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy' }));
    return;
  }
  
  // SSE endpoint
  if (req.url === '/sse' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('data: {"type":"ready"}\n\n');
    
    const interval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    
    req.on('close', () => clearInterval(interval));
    return;
  }
  
  // JSON-RPC endpoints
  if ((req.url === '/messages' || req.url === '/' || req.url === '/jsonrpc') && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const request = JSON.parse(body);
        const response = handleJsonRpc(request);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error'
          }
        }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
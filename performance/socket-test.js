import { WebSocket } from 'k6/ws';\nimport { check, sleep } from 'k6';\nimport { Counter, Rate, Trend } from 'k6/metrics';\n\n// Custom metrics\nconst connectionsEstablished = new Counter('websocket_connections_established');\nconst messagesSent = new Counter('websocket_messages_sent');\nconst messagesReceived = new Counter('websocket_messages_received');\nconst connectionErrors = new Counter('websocket_connection_errors');\nconst messageErrors = new Rate('websocket_message_errors');\nconst messageResponseTime = new Trend('websocket_message_response_time');\n\n// Test configuration\nexport let options = {\n  scenarios: {\n    // WebSocket connection test\n    ws_connections: {\n      executor: 'ramping-vus',\n      startVUs: 1,\n      stages: [\n        { duration: '10s', target: 10 },   // Ramp up to 10 users\n        { duration: '30s', target: 50 },   // Ramp up to 50 users\n        { duration: '1m', target: 50 },    // Stay at 50 users\n        { duration: '20s', target: 0 },    // Ramp down to 0\n      ],\n    },\n  },\n  thresholds: {\n    'websocket_connections_established': ['count>100'],  // At least 100 connections established\n    'websocket_message_errors': ['rate<0.05'],           // Less than 5% message errors\n    'websocket_message_response_time': ['p(95)<1000'],   // 95% of messages responded to within 1s\n  },\n};\n\n// Generate a unique session ID for each virtual user\nfunction generateSessionId() {\n  return `test-session-${__VU}-${__ITER}-${Date.now()}`;\n}\n\n// Generate a unique message ID\nfunction generateMessageId() {\n  return `msg-${__VU}-${__ITER}-${Date.now()}`;\n}\n\n// Create a message payload\nfunction createMessage() {\n  const messageId = generateMessageId();\n  return JSON.stringify({\n    id: messageId,\n    role: 'user',\n    content: `Test message from VU ${__VU}`,\n    created_at: new Date().toISOString(),\n  });\n}\n\nexport default function() {\n  // Determine the test URL based on environment or use a default\n  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';\n  const wsUrl = `ws://${baseUrl.replace(/^https?:\\/\\//, '')}/ws`;\n  \n  const sessionId = generateSessionId();\n  \n  // WebSocket connection parameters\n  const params = {\n    // WebSocket connection timeout in milliseconds\n    timeout: 10000,\n  };\n  \n  // Create WebSocket connection\n  const ws = new WebSocket(wsUrl, null, params);\n  \n  // Handle WebSocket events\n  ws.onopen = () => {\n    connectionsEstablished.add(1);\n    console.log(`VU ${__VU}: Connected to WebSocket`);\n  };\n  \n  // Track when we sent the message for response time calculation\n  let messageSentTime = 0;\n  \n  // Define a message handler to measure response time\n  ws.onmessage = (e) => {\n    try {\n      const data = JSON.parse(e.data);\n      messagesReceived.add(1);\n      \n      // Calculate response time if we've sent a message\n      if (messageSentTime > 0) {\n        const responseTime = Date.now() - messageSentTime;\n        messageResponseTime.add(responseTime);\n        messageSentTime = 0;  // Reset for next message\n      }\n      \n      // Validate response\n      check(data, {\n        'Response has correct format': (d) => d.id && d.role && d.content,\n      });\n    } catch (error) {\n      messageErrors.add(1);\n      console.error(`VU ${__VU}: Error processing message: ${error.message}`);\n    }\n  };\n  \n  ws.onerror = (e) => {\n    connectionErrors.add(1);\n    console.error(`VU ${__VU}: WebSocket error: ${e.error}`);\n  };\n  \n  ws.onclose = () => {\n    console.log(`VU ${__VU}: WebSocket connection closed`);\n  };\n  \n  // Check connection state\n  check(ws, { 'Connected successfully': (socket) => socket.readyState === WebSocket.OPEN });\n  \n  // Short pause to ensure connection is stable\n  sleep(1);\n  \n  // Send a message only if connected\n  if (ws.readyState === WebSocket.OPEN) {\n    const message = createMessage();\n    messageSentTime = Date.now();\n    ws.send(message);\n    messagesSent.add(1);\n    \n    // Check sending succeeded\n    check(ws, { 'Message sent successfully': () => true });\n    \n    // Wait for the response (up to 5 seconds)\n    sleep(5);\n  }\n  \n  // Close the WebSocket connection\n  ws.close();\n  \n  // Ensure we don't start a new iteration too quickly\n  sleep(1);\n}\n
## Overview

This MCP server provides specialized resources, tools, and prompts for Roblox Studio development. It allows LLM applications to access Roblox Studio documentation, templates, code generation capabilities, and other features through a standardized interface.

## Recent Updates (May 2025)

The latest update includes comprehensive improvements across multiple aspects of the server:

### 1. Code Coverage Enhancement
- **Increased Test Coverage Thresholds**: Raised from 60% to 80% for all metrics (branches, functions, lines, statements)
- **Additional Unit Tests**: Added comprehensive tests for authentication service and API version manager
- **WebSocket Transport Testing**: Implemented thorough unit tests for real-time communication layers
- **E2E Test Framework**: Added end-to-end test configurations and example tests

### 2. Performance Testing
- **K6 Load Testing Scripts**: Added sophisticated load testing for HTTP endpoints
- **WebSocket Stress Testing**: Implemented concurrent connection tests for real-time capabilities
- **GitHub Actions Integration**: Automated weekly performance testing with result reporting
- **Failure Notification System**: Automatic issue creation for performance regression

### 3. Security Enhancement
- **Authentication Security Tests**: Added tests for token tampering, authorization bypass, and input validation
- **Rate Limiting Tests**: Implementation of security checks for brute force prevention
- **Dependency Vulnerability Scanning**: Automated scanning for security issues in dependencies
- **OWASP ZAP Integration**: Automated regular scanning for common web vulnerabilities

### 4. Documentation Expansion
- **OpenAPI/Swagger Integration**: Added API documentation with interactive UI
- **JSDoc Implementation**: Comprehensive code-level documentation with type definitions
- **Docsify Documentation Site**: Interactive documentation with full Korean language support
- **Postman Collection**: Ready-to-use API request collection for quick implementation

## Enhanced Features

- **JWT Authentication**: Secure JWT-based authentication with role-based access control
- **Docker Support**: Easy deployment and scaling with Docker and Docker Compose
- **Testing Framework**: Unit and integration tests using Jest
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Security Enhancements**: HTTP header security with Helmet and environment variable validation
- **Improved Logging**: Structured logging system using Winston
- **Monitoring**: Prometheus and Grafana support (optional)
- **Extensible Architecture**: Modular design for easy expansion
- **WebSocket Support**: Alternative to SSE for better real-time communication
- **Connection Management**: Robust connection tracking and health monitoring
- **API Versioning**: Support for multiple API versions with graceful deprecation
- **Advanced Rate Limiting**: Flexible rate limiting strategies for API protection
- **Automatic Retries**: Configurable retry mechanisms for failed operations

## Features

- **Resources**: Access to Roblox Studio documentation, API references, and code templates
- **Tools**: Luau code generation and validation, asset search, game component creation
- **Prompts**: Special prompts for script generation, bug finding, and performance optimization
- **API Integration**: Direct connection to Roblox API and Open Cloud API
- **Interactive Systems**: Creation of dialogue systems, UI interfaces, and complex gameplay mechanics
- **Enhanced Performance**: Built-in caching and rate limiting for optimal performance
- **Robust Error Handling**: Comprehensive error management and graceful recovery
- **Metrics and Monitoring**: Built-in health checks and performance metrics

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Docker and Docker Compose (optional)
- Roblox API key (for API integration features)
- Roblox Open Cloud API key (for Open Cloud features)

## Installation

1. Clone the repository
``bash
git clone https://github.com/dmae97/roblox-studio-mcp-server-updated.git
cd roblox-studio-mcp-server-updated

Install dependencies

bashnpm install

Create a .env file based on .env.example

bashcp .env.example .env

Update the .env file with your Roblox API keys and other configuration

ROBLOX_API_KEY=your_api_key_here
ROBLOX_OPEN_CLOUD_API_KEY=your_open_cloud_api_key_here
ROBLOX_OPEN_CLOUD_UNIVERSE_ID=your_universe_id_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

Build the project

bashnpm run build
Running the Server
Start the server in development mode:
bashnpm run dev
Or start the production server:
bashnpm start
The server starts on port 3000 by default (configurable in .env).
Docker Deployment
You can also run the server using Docker:
bash# Build the image
npm run docker:build

# Run the container
npm run docker:run
Or using Docker Compose:
bashdocker-compose up -d
Running Tests
Run unit tests:
bashnpm test
Generate a test coverage report:
bashnpm run test:coverage
Run integration tests:
bashnpm run test:integration
Run security-focused tests:
bashnpm run test:security
Run performance tests:
bash# HTTP load testing
npm run test:performance

# WebSocket load testing
npm run test:websockets
Documentation
Generate and access documentation:
bash# Generate JSDoc documentation
npm run docs

# Start documentation server
npm run docs:dev
Access the interactive documentation at http://localhost:3000/api-docs when the server is running.
Security Auditing
Run security checks:
bash# Audit dependencies
npm run audit

# Fix vulnerabilities where possible
npm run audit:fix

# Run comprehensive security check
npm run security:check
API Endpoints
MCP-Related Endpoints

GET /sse - Server-Sent Events endpoint for MCP communication
GET /ws - WebSocket endpoint for MCP communication (alternative to SSE)
POST /messages - Message endpoint for MCP communication
GET /health - Server health check endpoint
GET /metrics - Server metrics endpoint
GET /api-docs - Interactive API documentation

Authentication Endpoints

POST /auth/login - User login and token issuance
POST /auth/refresh - Issue new access token using refresh token
GET /auth/validate - Validate token
GET /auth/admin - Admin privilege check (admin only)

Configuration Options
The server can be configured using environment variables in the .env file:
Server Configuration

PORT - Port to run the server on (default: 3000)
SERVER_NAME - Server name (default: "Roblox Studio MCP Server")
SERVER_VERSION - Server version (default: "1.0.0")
NODE_ENV - Environment (development/production)
DEBUG - Enable debug mode (true/false)
ENABLE_DOCS - Enable API documentation in production (true/false)

Logging Configuration

LOG_LEVEL - Logging level (info, warn, error, debug)
LOG_TIMESTAMP - Include timestamp in logs (true/false)
LOG_COLOR - Colorize log output (true/false)

Performance Settings

ENABLE_RATE_LIMITING - Enable rate limiting (true/false)
RATE_LIMIT_WINDOW - Rate limit time window (milliseconds)
RATE_LIMIT_MAX_REQUESTS - Maximum requests per window
CACHE_TTL - Time to live for cached data (seconds)
CACHE_CHECK_PERIOD - Check interval for expired cache items (seconds)

Security Settings

CORS_ORIGINS - Comma-separated list of allowed origins, or * for all
JWT_SECRET - Secret key for JWT token generation and verification
JWT_EXPIRES_IN - Token expiry time in seconds (default: 1 hour)
JWT_REFRESH_SECRET - Secret key for JWT refresh token generation and verification
JWT_REFRESH_EXPIRES_IN - Refresh token expiry time in seconds (default: 1 week)

Project Structure
.
├── src/                    # Source code
│   ├── api/                # API-related code
│   ├── auth/               # Authentication code
│   ├── connection/         # Connection management
│   ├── middleware/         # Express middleware
│   ├── resources/          # MCP resources
│   ├── tools/              # MCP tools
│   │   ├── datastore/      # DataStore tools
│   │   ├── interactive/    # Interactive system tools
│   │   ├── opencloud/      # Open Cloud integration tools
│   │   └── physics/        # Physics system tools
│   ├── prompts/            # MCP prompts
│   ├── tests/              # Test code
│   │   ├── api/            # API tests
│   │   ├── auth/           # Authentication tests
│   │   ├── connection/     # Connection tests
│   │   ├── middleware/     # Middleware tests
│   │   └── security/       # Security-focused tests
│   ├── utils/              # Utility functions
│   └── index.ts            # Application entry point
├── performance/            # Performance test scripts
├── docs/                   # Documentation site
├── prometheus/             # Prometheus configuration
├── .github/workflows/      # GitHub Actions workflows
├── .env.example            # Environment variable example
├── Dockerfile              # Docker build definition
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest configuration
├── jest.integration.config.js # Integration test configuration
└── README.md               # Documentation
Connecting to the MCP Server
Example 1: Using Claude with API
javascript// Example code for calling the MCP server from a web application using Claude
async function callRobloxMcp() {
  const response = await fetch('https://your-claude-api-endpoint/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-claude-api-key'
    },
    body: JSON.stringify({
      model: "claude-3.7-sonnet-20250219",
      messages: [
        {
          role: "user",
          content: "Help me create a platformer game in Roblox Studio"
        }
      ],
      tool_choice: "auto",
      tools: [
        {
          function: {
            name: "mcp",
            description: "Call the Roblox Studio MCP server",
            parameters: {
              type: "object",
              properties: {
                server_url: {
                  type: "string",
                  description: "URL of the MCP server"
                },
                tool_name: {
                  type: "string",
                  description: "Name of the MCP tool to call"
                },
                tool_parameters: {
                  type: "object",
                  description: "Parameters for the MCP tool"
                }
              },
              required: ["server_url", "tool_name"]
            }
          }
        }
      ]
    })
  });
  
  return await response.json();
}
Example 2: Using the MCP CLI Tool
You can also use the MCP server via the command line:
bash# Install the MCP client CLI
npm install -g @modelcontextprotocol/cli

# Connect to the MCP server
mcp connect http://localhost:3000

# Use an MCP tool
mcp tool generate-roblox-code --scriptType=ServerScript --functionality="Handle player movement" --includeComments=true

# Access a template
mcp resource template://roblox/game/platformer
Example 3: Connecting with Anthropic's Claude
pythonimport anthropic
from anthropic.tool_use import MCP

# Initialize Claude client
client = anthropic.Client(api_key="your-anthropic-api-key")

# Create MCP connection
mcp = MCP(server_url="http://localhost:3000")

# Send message to Claude with MCP capabilities
response = client.messages.create(
    model="claude-3.7-sonnet-20250219",
    max_tokens=1000,
    system="You are a helpful AI assistant with access to a Roblox Studio MCP server.",
    messages=[
        {
            "role": "user",
            "content": "I want to create a multiplayer game in Roblox Studio. What tools should I use?"
        }
    ],
    tools=[mcp.to_tool()]
)

print(response.content)
Troubleshooting
Common Issues

Connection Errors: Verify that your Roblox API key is correctly configured.
Authentication Failures: Check that your JWT secret keys are properly set.
High Memory Usage: Adjust Cache TTL settings to manage memory usage.
Rate Limit Errors: Adjust RATE_LIMIT_* settings for your environment.
Test Failures: Ensure environment variables are set in the test environment.
Documentation Generation Errors: Check that all required documentation dependencies are installed.

Logging
Set LOG_LEVEL=debug to enable detailed logging for debugging issues.
Contributing
Contributions are welcome! Please feel free to submit a PR.

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

License
MIT

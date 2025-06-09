# Roblox Studio MCP Server - Claude Enhanced Edition

## Overview

This MCP server provides specialized resources, tools, and prompts for Roblox Studio development. It allows LLM applications to access Roblox Studio documentation, templates, code generation capabilities, and other features through a standardized interface.

## 🚀 Claude Enhancement Updates (June 2025)

### Natural Language Processing
- **Korean Language Support**: Full support for Korean commands and responses (한국어 명령어 및 응답 완벽 지원)
- **Natural Command Processing**: Convert natural language to MCP tool calls automatically
- **Intent Recognition**: Smart detection of user intent from conversational input
- **Context Awareness**: Maintains conversation context for better understanding

### Interactive Features
- **Game Creation Wizard**: Step-by-step interactive game template creation
- **Code Explanation**: Explain Luau code in simple terms (Korean/English)
- **Learning Path Generator**: Personalized Roblox development learning plans
- **Project Analyzer**: Analyze and suggest improvements for Roblox projects

### Claude-Specific Tools
- `roblox-natural-command`: Process natural language commands
- `roblox-code-explain`: Explain code with adjustable detail levels
- `roblox-project-analyzer`: Comprehensive project analysis
- `roblox-template-wizard`: Interactive template creation
- `roblox-learning-path`: Generate personalized learning paths

### Enhanced API Endpoints
- `POST /claude/process`: Natural language command processing
- `GET /claude/prompts`: List available Claude prompts
- `POST /claude/wizard`: Interactive wizard endpoint
- `POST /claude/explain`: Code explanation service
- `POST /claude/learning-path`: Learning path generator

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
```bash
git clone https://github.com/dmae97/roblox-studio-mcp-server-updated.git
cd roblox-studio-mcp-server-updated
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file based on .env.example
```bash
cp .env.example .env
```

4. Update the .env file with your Roblox API keys and other configuration
```
ROBLOX_API_KEY=your_api_key_here
ROBLOX_OPEN_CLOUD_API_KEY=your_open_cloud_api_key_here
ROBLOX_OPEN_CLOUD_UNIVERSE_ID=your_universe_id_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

5. Build the project
```bash
npm run build
```

## Running the Server

Start the server in development mode:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The server starts on port 3000 by default (configurable in .env).

## Docker Deployment

You can also run the server using Docker:
```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

Or using Docker Compose:
```bash
docker-compose up -d
```

## 🤖 Using with Claude

### Quick Start with Natural Language

Simply tell Claude what you want in natural language:

```
"로블록스에서 간단한 플랫포머 게임을 만들어줘"
"Create a multiplayer racing game in Roblox"
"내 스크립트의 오류를 찾아줘"
"Explain this Luau code to me"
```

### Example Claude Conversation

```javascript
// Initialize MCP connection in your Claude app
const mcpServer = "http://localhost:3000/claude";

// Send natural language command
const response = await fetch(`${mcpServer}/process`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: "로블록스에서 2D 플랫포머 게임을 만들고 싶어",
    language: "ko"
  })
});

const result = await response.json();
// Claude will process this and suggest appropriate tools/templates
```

### Using the Interactive Wizard

```javascript
// Start the game creation wizard
const wizardResponse = await fetch(`${mcpServer}/wizard`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    step: "start",
    language: "ko"
  })
});
```

### Getting Code Explanations

```javascript
// Get explanation for Luau code
const explainResponse = await fetch(`${mcpServer}/explain`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: "local function onPlayerJoin(player)...",
    language: "ko",
    detailLevel: "simple"
  })
});
```

## API Endpoints

### MCP-Related Endpoints
- `GET /sse` - Server-Sent Events endpoint for MCP communication
- `GET /ws` - WebSocket endpoint for MCP communication (alternative to SSE)
- `POST /messages` - Message endpoint for MCP communication
- `GET /health` - Server health check endpoint
- `GET /metrics` - Server metrics endpoint
- `GET /api-docs` - Interactive API documentation

### Claude-Enhanced Endpoints
- `POST /claude/process` - Process natural language commands
- `GET /claude/prompts` - Get available Claude prompts
- `POST /claude/prompts/:name` - Execute specific Claude prompt
- `GET /claude/tools` - Get available Claude tools
- `POST /claude/tools/:name` - Execute specific Claude tool
- `POST /claude/wizard` - Interactive wizard endpoint
- `POST /claude/explain` - Code explanation endpoint
- `POST /claude/learning-path` - Learning path generator
- `GET /claude/health` - Claude integration health check

### Authentication Endpoints
- `POST /auth/login` - User login and token issuance
- `POST /auth/refresh` - Issue new access token using refresh token
- `GET /auth/validate` - Validate token
- `GET /auth/admin` - Admin privilege check (admin only)

## Configuration Options

The server can be configured using environment variables in the .env file:

### Server Configuration
- `PORT` - Port to run the server on (default: 3000)
- `SERVER_NAME` - Server name (default: "Roblox Studio MCP Server")
- `SERVER_VERSION` - Server version (default: "1.0.0")
- `NODE_ENV` - Environment (development/production)
- `DEBUG` - Enable debug mode (true/false)
- `ENABLE_DOCS` - Enable API documentation in production (true/false)

### Claude Configuration
- `CLAUDE_ENABLED` - Enable Claude enhancements (default: true)
- `CLAUDE_DEFAULT_LANGUAGE` - Default language (ko/en/auto)
- `CLAUDE_NLP_ENABLED` - Enable natural language processing (default: true)

### Logging Configuration
- `LOG_LEVEL` - Logging level (info, warn, error, debug)
- `LOG_TIMESTAMP` - Include timestamp in logs (true/false)
- `LOG_COLOR` - Colorize log output (true/false)

### Performance Settings
- `ENABLE_RATE_LIMITING` - Enable rate limiting (true/false)
- `RATE_LIMIT_WINDOW` - Rate limit time window (milliseconds)
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window
- `CACHE_TTL` - Time to live for cached data (seconds)
- `CACHE_CHECK_PERIOD` - Check interval for expired cache items (seconds)

### Security Settings
- `CORS_ORIGINS` - Comma-separated list of allowed origins, or * for all
- `JWT_SECRET` - Secret key for JWT token generation and verification
- `JWT_EXPIRES_IN` - Token expiry time in seconds (default: 1 hour)
- `JWT_REFRESH_SECRET` - Secret key for JWT refresh token generation and verification
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry time in seconds (default: 1 week)

## Project Structure

```
.
├── src/                    # Source code
│   ├── api/                # API-related code
│   │   └── claude-api.ts   # Claude-specific endpoints
│   ├── auth/               # Authentication code
│   ├── connection/         # Connection management
│   ├── middleware/         # Express middleware
│   ├── resources/          # MCP resources
│   ├── tools/              # MCP tools
│   │   ├── claude-tools.ts # Claude-enhanced tools
│   │   ├── datastore/      # DataStore tools
│   │   ├── interactive/    # Interactive system tools
│   │   ├── opencloud/      # Open Cloud integration tools
│   │   └── physics/        # Physics system tools
│   ├── prompts/            # MCP prompts
│   │   └── claude-prompts.ts # Claude-enhanced prompts
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
├── claude.config.json      # Claude integration configuration
├── claude-prompts.md       # Claude prompt guide
├── Dockerfile              # Docker build definition
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest configuration
├── jest.integration.config.js # Integration test configuration
└── README.md               # Documentation
```

## Connecting to the MCP Server

### Example 1: Using Claude with Natural Language

```javascript
// Example: Natural language processing with Claude
async function talkToRobloxMCP(userInput) {
  const response = await fetch('http://localhost:3000/claude/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token'
    },
    body: JSON.stringify({
      command: userInput,
      context: {
        userLevel: 'beginner',
        projectType: 'platformer'
      }
    })
  });
  
  const result = await response.json();
  console.log('Claude processed:', result.processed);
  console.log('Suggested tools:', result.processed.suggestedTools);
  
  return result;
}

// Usage
await talkToRobloxMCP("로블록스에서 캐릭터가 2단 점프할 수 있게 만들어줘");
```

### Example 2: Using the Interactive Wizard

```javascript
// Example: Step-by-step game creation wizard
async function createGameWithWizard() {
  let step = 'start';
  let previousChoices = {};
  
  while (step !== 'complete') {
    const response = await fetch('http://localhost:3000/claude/wizard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, previousChoices, language: 'ko' })
    });
    
    const result = await response.json();
    console.log(result.wizard.message);
    
    // Get user input for next step...
    step = result.wizard.nextStep;
    previousChoices = { ...previousChoices, [step]: userChoice };
  }
}
```

### Example 3: Getting Code Explanations

```javascript
// Example: Explain Luau code in simple terms
async function explainRobloxCode(code) {
  const response = await fetch('http://localhost:3000/claude/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      language: 'ko',
      detailLevel: 'simple'
    })
  });
  
  const result = await response.json();
  return result.explanation;
}

// Usage
const explanation = await explainRobloxCode(`
  local Players = game:GetService("Players")
  
  Players.PlayerAdded:Connect(function(player)
    print(player.Name .. " joined the game!")
  end)
`);
```

### Example 4: Using with Anthropic's Claude API

```python
import anthropic
from anthropic.tool_use import MCP

# Initialize Claude client
client = anthropic.Client(api_key="your-anthropic-api-key")

# Create MCP connection with Claude enhancements
mcp = MCP(server_url="http://localhost:3000")

# Send message to Claude with MCP capabilities
response = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1000,
    system="""You are a helpful AI assistant with access to a Roblox Studio MCP server.
    You can understand both Korean and English. Always provide helpful, accurate, 
    and beginner-friendly guidance for Roblox development.""",
    messages=[
        {
            "role": "user",
            "content": "로블록스에서 RPG 게임을 만들고 싶어. 어떻게 시작해야 할까?"
        }
    ],
    tools=[mcp.to_tool()]
)

print(response.content)
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify that your Roblox API key is correctly configured.
2. **Authentication Failures**: Check that your JWT secret keys are properly set.
3. **High Memory Usage**: Adjust Cache TTL settings to manage memory usage.
4. **Rate Limit Errors**: Adjust RATE_LIMIT_* settings for your environment.
5. **Test Failures**: Ensure environment variables are set in the test environment.
6. **Documentation Generation Errors**: Check that all required documentation dependencies are installed.
7. **Claude Integration Issues**: Ensure claude.config.json is properly configured.
8. **Korean Language Issues**: Check that CLAUDE_DEFAULT_LANGUAGE is set correctly.

### Logging

Set `LOG_LEVEL=debug` to enable detailed logging for debugging issues.

## Contributing

Contributions are welcome! Please feel free to submit a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Add tests for new features
- Update documentation
- Follow TypeScript best practices
- Ensure Korean language support for Claude features
- Test with both Korean and English inputs

## License

MIT

## Acknowledgments

- Original MCP server implementation
- Anthropic Claude team for AI capabilities
- Roblox Studio community for feedback and suggestions
- Korean Roblox developer community for localization support
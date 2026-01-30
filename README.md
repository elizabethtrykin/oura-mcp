# Oura MCP Server

A Model Context Protocol (MCP) server for accessing Oura Ring health and biometric data.

## Setup

### Prerequisites
- [Bun](https://bun.sh/) (v1+) or Node.js (v18+)
- Oura account

### Installation
```bash
bun install
bun run build
```

## Configuration

### Obtaining Credentials
1. Log in to [Oura Cloud Console](https://cloud.ouraring.com/)
2. Get either:
   - [Personal Access Token](https://cloud.ouraring.com/personal-access-tokens) (for testing)
   - [OAuth2 Credentials](https://cloud.ouraring.com/oauth/applications) (for production)

### Environment Variables
Create a `.env` file:
```
# Option 1: Personal Access Token
OURA_PERSONAL_ACCESS_TOKEN=your_token

# Option 2: OAuth2 credentials
OURA_CLIENT_ID=your_client_id
OURA_CLIENT_SECRET=your_client_secret
OURA_REDIRECT_URI=http://localhost:3000/callback
```

## Integration

### Claude Desktop

Add to Claude Desktop config (Settings > Developer > Edit Config):

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
    "mcpServers": {
        "oura": {
            "command": "bun",
            "args": ["run", "/absolute/path/to/oura-mcp/build/index.js"],
            "env": {"OURA_PERSONAL_ACCESS_TOKEN": "your_token"}
        }
    }
}
```

Restart Claude Desktop after saving. See [MCP docs](https://modelcontextprotocol.io/quickstart/user) for details.

### Claude Code (CLI)

```bash
claude mcp add oura -s user -- bun run /absolute/path/to/oura-mcp/build/index.js
```

Set your token in the shell environment:
```bash
export OURA_PERSONAL_ACCESS_TOKEN=your_token
```

Or the server will load it from the `.env` file in the project directory.

### Remote HTTP Deployment

Start in HTTP mode:
```bash
# Direct
bun run start:http

# Or with environment variables
MCP_TRANSPORT=http MCP_PORT=3000 bun run build/index.js --http
```

**Docker:**
```bash
export OURA_PERSONAL_ACCESS_TOKEN=your_token
docker compose up -d
```

The HTTP server exposes:
- `POST /mcp` — MCP protocol endpoint
- `GET /mcp` — SSE streaming endpoint
- `DELETE /mcp` — session cleanup
- `GET /health` — health check

Optional: set `MCP_API_KEY` to require `Authorization: Bearer <key>` on all `/mcp` requests.

## Development

```bash
# Run directly from TypeScript (no build step)
bun run dev

# Run HTTP mode from TypeScript
bun run dev:http

# Build
bun run build

# Test
bun test
```

## Available Resources
- `personal_info` — User profile
- `daily_activity` — Activity summaries
- `daily_readiness` — Readiness scores
- `daily_sleep` — Sleep summaries
- `sleep` — Detailed sleep data
- `sleep_time` — Sleep timing
- `workout` — Workout data
- `session` — Session data
- `daily_spo2` — SpO2 measurements
- `rest_mode_period` — Rest periods
- `ring_configuration` — Ring config
- `daily_stress` — Stress metrics
- `daily_resilience` — Resilience metrics
- `daily_cardiovascular_age` — CV age
- `vO2_max` — VO2 max data

## Available Tools
For date-based resources, use tools like `get_daily_sleep` with `startDate` and `endDate` parameters (YYYY-MM-DD).

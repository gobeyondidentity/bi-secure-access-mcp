# Beyond Identity Secure Access MCP Server

## What This MCP Offers

- An MCP server that enables Claude to interact with the Beyond Identity Secure Access API
- Supports both **stdio** (standard I/O) and **HTTP/SSE** (Server-Sent Events) transport modes
- Exposes one tool per API operation derived from the OpenAPI spec (97 tools total)
- Manages resources including tenants, realms, identities, credentials, groups, and related objects
- All API calls are authorized using a tenant-scoped API token that determines access permissions
- Docker support for easy deployment and scaling

API Documentation: [https://docs.beyondidentity.com/api/v1](https://docs.beyondidentity.com/api/v1)

## Quick Start

### 1. Build the Server

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build
```

The compiled server entry point will be at `build/index.js`.

### 2. Get Your API Credentials

From the Beyond Identity Secure Access Admin Console:

1. Log in to your admin console
2. Navigate to **Access Control → API Access**
3. Generate an API token with required scopes (copy immediately - shown only once)
4. Note your `tenant_id` from the URL: `.../tenants/<tenant_id>/realms/<realm_id>`
5. Note a `realm_id` for testing purposes

## Transport Modes

This MCP server supports two transport modes:

### stdio Mode (Default)
- Communication via standard input/output
- Used for Claude CLI integration
- Best for local development and CLI tools
- Set `MCP_TRANSPORT=stdio` or leave unset

### HTTP/SSE Mode
- Communication via Server-Sent Events over HTTP
- Enables remote access and web-based clients
- Includes health check endpoint for monitoring
- Best for containerized deployments and production environments
- Set `MCP_TRANSPORT=http`

## Docker Deployment

### Quick Start with Docker Compose

1. Clone the repository and navigate to the directory:
```bash
cd bi-secure-access-mcp
```

2. Create a `.env` file with your API token:
```bash
cp .env.example .env
# Edit .env and add your BEARER_TOKEN_BEARERAUTH
```

3. Start the server:
```bash
docker-compose up -d
```

4. Check the health status:
```bash
curl http://localhost:3000/health
```

### Docker Commands

#### Build the image:
```bash
docker build -t bi-secure-access-mcp:latest .
```

#### Run with environment variables:
```bash
docker run -d \
  --name bi-mcp-server \
  -p 3000:3000 \
  -e MCP_TRANSPORT=http \
  -e BEARER_TOKEN_BEARERAUTH="your_api_token_here" \
  -e PORT=3000 \
  bi-secure-access-mcp:latest
```

#### View logs:
```bash
docker logs -f bi-mcp-server
```

#### Stop and remove:
```bash
docker stop bi-mcp-server
docker rm bi-mcp-server
```

### Docker Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BEARER_TOKEN_BEARERAUTH` | Yes | - | Beyond Identity API token |
| `MCP_TRANSPORT` | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | HTTP server port (HTTP mode only) |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated CORS origins (HTTP mode only) |
| `NODE_ENV` | No | `production` | Node environment |

### HTTP/SSE Endpoints

When running in HTTP mode, the following endpoints are available:

- **GET `/health`** - Health check endpoint
  ```bash
  curl http://localhost:3000/health
  ```

- **GET `/sse`** - Establish SSE connection
  - Returns a session ID for message routing
  - Maintains an open connection for server-to-client messages

- **POST `/message?sessionId=<id>`** - Send messages to the server
  - Requires `sessionId` query parameter from SSE connection
  - Request body contains the MCP protocol message

### Production Deployment

For production deployments, consider:

1. **Use secrets management** for `BEARER_TOKEN_BEARERAUTH`
2. **Configure ALLOWED_ORIGINS** to restrict CORS access
3. **Set up reverse proxy** (nginx, traefik) for TLS termination
4. **Configure resource limits** in docker-compose.yml
5. **Enable log aggregation** for centralized logging
6. **Set up monitoring** using the `/health` endpoint

Example with docker-compose and secrets:
```yaml
services:
  bi-mcp-server:
    image: bi-secure-access-mcp:latest
    environment:
      - MCP_TRANSPORT=http
      - BEARER_TOKEN_BEARERAUTH_FILE=/run/secrets/bi_api_token
      - ALLOWED_ORIGINS=https://app.example.com
    secrets:
      - bi_api_token

secrets:
  bi_api_token:
    external: true
```

## Configuration

**Note:** For stdio mode, this MCP server has been tested with Claude CLI.

### Claude CLI Setup

#### Global Installation (persists across projects)

```bash
claude mcp add beyond-identity --scope user \
  --env BEARER_TOKEN_BEARERAUTH="<YOUR_API_TOKEN>" \
  -- node /absolute/path/to/build/index.js
```

#### Project-Specific Installation

```bash
# Run from project directory
claude mcp add beyond-identity \
  --env BEARER_TOKEN_BEARERAUTH="<YOUR_API_TOKEN>" \
  -- node /absolute/path/to/bi-secure-access-mcp/build/index.js
```

#### Verify Installation

```bash
claude mcp list
claude mcp get beyond-identity
```

#### Update Token

```bash
claude mcp remove beyond-identity
claude mcp add beyond-identity --scope user \
  --env BEARER_TOKEN_BEARERAUTH="<NEW_TOKEN>" \
  -- node /absolute/path/to/build/index.js
```

## Usage Examples

Start a Claude session:

```bash
claude
```

### Basic Tool Discovery

**Prompt:**
> From the `beyond-identity` MCP server, list the available tools. Show me the names and a one-line description for each.

Expected tools include `ListRealms`, `GetRealm`, `CreateIdentity`, `ListCredentials`, etc.

### List Realms for a Tenant

**Prompt:**
> Using the `beyond-identity` MCP server, call the tool that lists realms for a tenant. Use `tenant_id: "<YOUR_TENANT_ID>"`. Return a table of `id`, `display_name`, and `update_time` for up to 20 realms.

### Chain Multiple API Calls

**Prompt:**
> Use the realms list tool with `tenant_id: "<YOUR_TENANT_ID>"`, take the first realm's `id`, then call the tool that gets a realm by id with that `realm_id`. Summarize the realm details.

### Working with Identities

**List and Filter Identities:**
> Step 1: List identities for `tenant_id: "<YOUR_TENANT_ID>"` and `realm_id: "<YOUR_REALM_ID>"` with page_size of 50.
> Step 2: Filter for identities with email containing "@example.com".
> Step 3: Get full details for the first matching identity.

**Create an Identity:**
> Create a new identity in realm `<YOUR_REALM_ID>` with display name "Test User" and email "test@example.com". Then retrieve it to confirm creation.

### Managing Credentials

**List and Revoke Credentials:**
> Step 1: List credentials for `tenant_id: "<YOUR_TENANT_ID>"`, `realm_id: "<YOUR_REALM_ID>"`, and `identity_id: "<IDENTITY_ID>"`.
> Step 2: If there's an active credential, revoke it.
> Step 3: Re-list credentials to confirm the status change.

### Pagination

**Handle Paginated Results:**
> List all realms for `tenant_id: "<YOUR_TENANT_ID>"` with `page_size: 20`. If there's a `page_token` in the response, fetch all pages and combine into a single table.

## Available Resource Types

The MCP server provides tools for managing:

- **Tenants**: Organization-level configuration
- **Realms**: Identity domains within tenants
- **Identities**: User accounts and profiles
- **Credentials**: Passkeys and authentication methods
- **Groups**: Identity groupings for access control
- **Applications**: OAuth and OIDC applications
- **Authenticator Configs**: Authentication method settings
- **Resource Servers**: Protected API resources
- **Events**: Audit logs and activity tracking

## Best Practices

### Security
- Never include the `BEARER_TOKEN_BEARERAUTH` value in prompts or logs
- Store tokens securely and rotate them regularly
- Use tokens with minimal required scopes

### API Usage
- Always provide `tenant_id` as it's required for most operations
- Include `realm_id` and `identity_id` when the operation requires them
- Use pagination parameters (`page_size`, `page_token`) for large result sets
- Handle rate limits appropriately

### Error Handling
- **401/403**: Token is invalid or lacks required scopes
- **404**: Verify the resource IDs are correct
- **429**: Rate limit exceeded - implement backoff strategy

## Development

### Project Structure

```
bi-secure-access-mcp/
├── src/
│   └── index.ts        # TypeScript source
├── build/
│   └── index.js        # Compiled entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

### Scripts

```bash
# Build the project
npm run build

# Type checking
npm run typecheck

# Start the server
npm start
```

## Troubleshooting

### Server Won't Start

**Local (stdio mode):**
- Verify Node.js version >= 20.0.0
- Check that `build/index.js` exists (run `npm run build` if not)
- Ensure all dependencies are installed (`npm install`)

**Docker (HTTP mode):**
- Check Docker logs: `docker logs bi-mcp-server`
- Verify the image built successfully: `docker images | grep bi-secure-access-mcp`
- Ensure port 3000 is not already in use: `lsof -i :3000` (macOS/Linux)
- Check container status: `docker ps -a | grep bi-mcp-server`

### Authentication Failures
- Verify your API token is valid and not expired
- Check that the token has necessary scopes for the operations
- Ensure the `BEARER_TOKEN_BEARERAUTH` environment variable is set correctly
- For Docker: Verify the environment variable is passed: `docker inspect bi-mcp-server | grep BEARER_TOKEN`

### Connection Issues

**API Connection:**
- Verify network connectivity to `https://api-us.beyondidentity.com`
- Check firewall settings for outbound HTTPS traffic
- For EU tenants, the API endpoint will differ

**HTTP/SSE Mode:**
- Test health endpoint: `curl http://localhost:3000/health`
- Check if port is exposed: `docker port bi-mcp-server` (Docker)
- Verify CORS settings if connecting from browser
- Check network connectivity: `docker network ls` (Docker)

### Docker-Specific Issues

**Container keeps restarting:**
- Check logs for errors: `docker logs bi-mcp-server`
- Verify environment variables are set correctly
- Ensure API token is valid
- Check health check status: `docker inspect --format='{{.State.Health.Status}}' bi-mcp-server`

**Health check failing:**
- Verify the server started: `docker logs bi-mcp-server | grep "running on HTTP"`
- Check if curl is available in container: `docker exec bi-mcp-server curl --version`
- Test health endpoint manually: `docker exec bi-mcp-server curl -f http://localhost:3000/health`

**Build failures:**
- Clear Docker cache: `docker builder prune`
- Check for TypeScript errors: `npm run typecheck` locally
- Verify all files are present (check .dockerignore)

## Support

- **API Documentation**: [Beyond Identity API Docs](https://docs.beyondidentity.com/api/v1)
- **MCP Protocol**: [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- **Issues**: Open an issue in this repository

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Generated using [OpenAPI MCP Generator](https://github.com/harsha-iiiv/openapi-mcp-generator)
- Powered by [Beyond Identity](https://www.beyondidentity.com)

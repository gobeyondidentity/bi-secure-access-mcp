# Beyond Identity Secure Access MCP Server

## What This MCP Offers

- An MCP server that enables Claude to interact with the Beyond Identity Secure Access API over stdio
- Exposes one tool per API operation derived from the OpenAPI spec (97 tools total)
- Manages resources including tenants, realms, identities, credentials, groups, and related objects
- All API calls are authorized using a tenant-scoped API token that determines access permissions

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

## Configuration

**Note:** This MCP server has only been tested with Claude CLI.

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
- Verify Node.js version >= 20.0.0
- Check that `build/index.js` exists (run `npm run build` if not)
- Ensure all dependencies are installed (`npm install`)

### Authentication Failures
- Verify your API token is valid and not expired
- Check that the token has necessary scopes for the operations
- Ensure the `BEARER_TOKEN_BEARERAUTH` environment variable is set correctly

### Connection Issues
- Verify network connectivity to `https://api-us.beyondidentity.com`
- Check firewall settings for outbound HTTPS traffic
- For EU tenants, the API endpoint will differ

## Support

- **API Documentation**: [Beyond Identity API Docs](https://docs.beyondidentity.com/api/v1)
- **MCP Protocol**: [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- **Issues**: Open an issue in this repository

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Generated using [OpenAPI MCP Generator](https://github.com/harsha-iiiv/openapi-mcp-generator)
- Powered by [Beyond Identity](https://www.beyondidentity.com)

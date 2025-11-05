# Multi-stage Dockerfile for Beyond Identity MCP Server
# Stage 1: Builder - Install dependencies and build TypeScript
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production - Create minimal runtime image
FROM node:20-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/build ./build

# Create non-root user for security
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 && \
    chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose port for HTTP/SSE mode (default 3000)
EXPOSE 3000

# Environment variables with defaults
ENV NODE_ENV=production \
    MCP_TRANSPORT=http \
    PORT=3000

# Health check (supports both MCP_PORT and PORT)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD sh -c 'curl -f http://localhost:${MCP_PORT:-${PORT:-3000}}/health || exit 1'

# Start the server
CMD ["node", "build/index.js"]

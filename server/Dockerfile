# ==============================================================================
# OfflineBridge — Server (Backend API) Dockerfile
# Production-ready, secure, lightweight Node.js container
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set default production environment
ENV NODE_ENV=production \
    PORT=5000

# Install dependency files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --prefer-offline --no-audit

# Copy application source code
COPY . .

# Set execution permissions and assign ownership to non-root node user
RUN chmod +x ./docker-entrypoint.sh && \
    chown -R node:node /app

# Run as non-root user for security
USER node

# Expose backend port
EXPOSE 5000

# Container healthcheck using backend /api/health endpoint
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=10s \
  CMD wget -qO- http://localhost:5000/api/health | grep -q 'ok' || exit 1

# Entrypoint script runs migrations and seeds initial database if configured
ENTRYPOINT ["./docker-entrypoint.sh"]

# Default execution command
CMD ["node", "src/index.js"]


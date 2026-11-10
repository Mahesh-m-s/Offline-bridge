# ==============================================================================
# OfflineBridge — Client (Frontend PWA) Dockerfile
# Multi-stage build: compiles Vite PWA and serves via lightweight Nginx
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using package-lock.json to leverage layer caching
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy client source files
COPY . .

# Set default backend API base URL for build-time compilation
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle with PWA service worker and assets
RUN npm run build

# Stage 2: Production Nginx web server
FROM nginx:1.27-alpine

# Remove default nginx static web page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and PWA caching rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Health check to ensure Nginx is healthy and serving HTML
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ | grep -q 'OfflineBridge' || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]


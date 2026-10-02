# Build stage
FROM node:26-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --no-package-lock

# Copy project files
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV VITE_MODE=production

# Build only web version
ENV BUILD_TARGET=web
RUN npm run build:web

# Production stage
FROM nginx:alpine

# Copy built web files
COPY --from=build-stage /app/src/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Allow nginx to run as the non-root nginx user.
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /var/run/nginx.pid

# Expose unprivileged HTTP port
EXPOSE 8080

USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"] 
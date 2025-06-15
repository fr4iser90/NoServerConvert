# Build stage
FROM node:20-alpine AS build-stage

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
COPY --from=build-stage /app/dist/web /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
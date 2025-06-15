# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for latest versions
RUN npm install --no-package-lock

# Copy project files
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV VITE_MODE=production

# Ensure Vite is properly installed and build
RUN npm rebuild vite && npm run build

# Production stage
FROM nginx:alpine AS stage-1

# Copy built files from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
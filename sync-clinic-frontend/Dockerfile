# ==========================================
# STAGE 1: Build the React App
# ==========================================
# CHANGED THIS TO NODE 22 TO SATISFY VITE!
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all other project files
COPY . .

# Build the production static files
RUN npm run build

# ==========================================
# STAGE 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the static files from the Builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html 

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
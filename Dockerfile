# Stage 1: Build the admin app (if you haven't built it yet)
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY ./build /usr/share/nginx/html
# If Angular: COPY ./dist/your-app-name /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching dependencies
COPY package*.json ./

# Install dependencies (including production dependencies)
RUN npm install --production

# Copy all the application files into the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Start the Next.js server in production mode
CMD ["npm", "start"]
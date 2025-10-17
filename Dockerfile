# Use Node.js 18 Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Expose the port Vite runs on
EXPOSE 8080

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

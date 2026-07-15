FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

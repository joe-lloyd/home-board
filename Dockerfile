FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy source
COPY . .

# Install docker CLI & git & openssl (for Prisma on Alpine)
RUN apk add --no-cache docker-cli docker-cli-compose git openssl

# Install dependencies and build
RUN pnpm install
RUN pnpm build

# Prune dev dependencies (optional, but good for size)
# RUN pnpm prune --prod 
# (Skipping prune for now to ensure all workspace links work easily)

EXPOSE 3000

# Make start script executable
RUN chmod +x scripts/start.sh

# Start API (which serves static frontend)
CMD ["sh", "scripts/start.sh"]

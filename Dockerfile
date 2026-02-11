# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app

# Install system dependencies required by gRPC native modules
RUN apk add --no-cache libc6-compat python3 make g++

# copy project files and install dependencies
FROM base AS runner
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# run the app
EXPOSE 8080
ENTRYPOINT [ "bun", "index.ts" ]
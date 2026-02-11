# use the official Bun image (Debian-based for gRPC native module compatibility)
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.5-debian AS base
WORKDIR /app

# copy project files and install dependencies
COPY package.json bun.lock ./
RUN bun install
COPY . .

# run the app
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT [ "bun", "run", "index.ts" ]
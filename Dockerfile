# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app


# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS runner
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY . .

RUN bun install
WORKDIR /app

# run the app
EXPOSE 3001
ENTRYPOINT [ "bun", "index.ts" ]
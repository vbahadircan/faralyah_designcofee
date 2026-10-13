# Build context is the repo root (see docker-compose.yml).
# bookworm-slim (glibc) rather than alpine: argon2 and sharp ship prebuilt glibc binaries.

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared/package.json shared/
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
# Full node_modules on purpose: `npm run admin:create` and `content:init` run with tsx inside the container.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/shared ./shared
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/src ./server/src
COPY --from=build /app/server/seed ./server/seed
COPY --from=build /app/server/tsconfig.json ./server/tsconfig.json
COPY --from=build /app/client/dist ./client/dist

# uploads/ is a volume; the node user must own it.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
USER node
EXPOSE 3000
CMD ["node", "server/dist/index.js"]

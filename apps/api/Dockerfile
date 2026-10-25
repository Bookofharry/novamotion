# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies across workspaces
RUN npm ci

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first, then api
RUN npm run build --workspace=@videolab/shared
RUN npm run build --workspace=@videolab/api

# --- Production Runner Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy node_modules and built outputs from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/server.js"]

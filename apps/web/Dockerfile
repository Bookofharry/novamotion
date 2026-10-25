# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy sources
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared first, then web
RUN npm run build --workspace=@videolab/shared
RUN npm run build --workspace=@videolab/web

# --- Production Web Server Stage ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

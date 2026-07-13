# Build container
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Copy package.jsons to leverage caching
COPY admin/package.json ./admin/
COPY webcomponent/package.json ./webcomponent/

RUN pnpm i --frozen-lockfile

# Copy the rest of the files
COPY . ./

# Build both components simultaneously
RUN pnpm run -r build

# Move outputs to root
WORKDIR /app
RUN rm -rf ./.output
RUN rm -rf ./admin/.output/public/webcomponent
RUN cp -r webcomponent/dist ./admin/.output/public/webcomponent
RUN cp -r ./admin/.output ./.output

# Deployment container
FROM node:lts-alpine AS deployment
WORKDIR /app

# Copy built app and dependencies
COPY --from=builder /app/.output ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/admin/package.json ./admin/
COPY --from=builder /app/admin/prisma ./prisma
COPY --from=builder /app/webcomponent/package.json ./webcomponent/

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Install production dependencies without running any scripts
RUN pnpm i --dev --ignore-scripts --frozen-lockfile

# Rebuild native modules for Prisma inside admin
RUN pnpm rebuild esbuild @prisma/engines prisma || true
RUN pnpm prisma generate

COPY --from=builder /app/entrypoint.sh /entrypoint

# Ensure we can actually run the entrypoint script
RUN chmod +x /entrypoint
EXPOSE 3000
ENTRYPOINT ["/entrypoint"]
CMD ["node", "./server/index.mjs"]

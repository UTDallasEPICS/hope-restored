FROM node:22-alpine AS builder

WORKDIR /app
COPY . .

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app/webcomponent
RUN pnpm i --force && pnpm run build

WORKDIR /app/admin
RUN pnpm i --force && pnpm prisma generate && pnpm run build

WORKDIR /app
RUN rm -rf ./.output \
  && rm -rf ./admin/.output/public/webcomponent \
  && cp -r webcomponent/dist ./admin/.output/public/webcomponent \
  && cp -r ./admin/.output ./.output

FROM node:22-alpine AS deployment
WORKDIR /
COPY --from=builder /app/.output/ ./
EXPOSE 3000
CMD ["node", "./server/index.mjs"]

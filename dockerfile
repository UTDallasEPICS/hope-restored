FROM node:22-alpine AS builder
COPY . ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm i --frozen-lockfile

RUN pnpm --filter webcomponent run build
RUN pnpm --filter nuxt-app exec prisma generate
RUN pnpm --filter nuxt-app run build

RUN rm -rf ./.output
RUN rm -rf ./admin/.output/public/webcomponent
RUN cp -r webcomponent/dist ./admin/.output/public/webcomponent
RUN cp -r ./admin/.output ./.output

FROM node:22-alpine AS deployment

COPY --from=builder /.output /
EXPOSE 3000
CMD ["node", "./server/index.mjs"]

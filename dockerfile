FROM node:22-alpine AS builder
COPY . ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm i --force
RUN ./build.sh

FROM node:22-alpine AS deployment

COPY --from=builder /.output /
EXPOSE 3000
CMD ["node", "./server/index.mjs"]
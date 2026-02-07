FROM node:current-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV DATABASE_URL = file:./dev.db


RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . ./

WORKDIR /webcomponent
RUN pnpm install --force 
RUN pnpm run build

WORKDIR /admin
RUN pnpm install --force && pnpm run build
RUN pnpm prisma generate

WORKDIR /

RUN rm -rf ./.output
RUN rm -rf ./admin/.output/public/webcomponent
RUN cp -r webcomponent/dist ./admin/.output/public/webcomponent
RUN cp -r ./admin/.output ./.output

FROM node:current-alpine AS deployment

COPY --from=builder /.output /
EXPOSE 3000
CMD ["node", "./server/index.mjs"]

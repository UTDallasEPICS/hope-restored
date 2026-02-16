FROM node:current-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV DATABASE_URL = file:./dev.db
RUN echo $PATH
RUN npm uninstall -g yarn pnpm
RUN npm install -g corepack --force
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . ./
RUN cd webcomponent && npm install --force && pnpm run build

WORKDIR /admin
RUN npm install --force && pnpm run build
RUN npx prisma generate

WORKDIR /
RUN rm -rf ./.output
RUN rm -rf ./admin/.output/public/webcomponent
RUN cp -r webcomponent/dist ./admin/.output/public/webcomponent
RUN cp -r ./admin/.output ./.output

FROM node:current-alpine AS deployment

COPY --from=builder /.output /
EXPOSE 3000
CMD ["node", "./server/index.mjs"]

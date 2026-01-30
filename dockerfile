FROM node:22-alpine AS builder
COPY . ./

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm i --force

RUN cd webcomponent && pnpm run build
RUN cd ../admin && pnpm prisma generate && pnpm run build
RUN cd ..
RUN rm -rf ./.output
RUN rm -rf ./admin/.output/public/webcomponent
RUN cp -r webcomponent/dist ./admin/.output/public/webcomponent
RUN cp -r ./admin/.output ./.output

FROM node:22-alpine AS deployment

COPY --from=builder /.output /
EXPOSE 3000
CMD ["node", "./server/index.mjs"]
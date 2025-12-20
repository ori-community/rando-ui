FROM node:lts-alpine AS build

WORKDIR /build

COPY ./web /build/web
COPY ./shared /build/shared

RUN cd /build/shared && \
    npm ci && \
    cd /build/web && \
    npm ci && \
    npm run build


FROM node:lts-alpine

WORKDIR /app
COPY --from=build /build/web/.output/ /app/

ENTRYPOINT ["node", "server/index.mjs"]

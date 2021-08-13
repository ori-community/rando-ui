# Stage 1
FROM node:alpine as build

ENV API_BASE_URL=/api

WORKDIR /app
COPY . /app
RUN yarn install \
 && API_BASE=wotw.orirando.com API_SECURE=true yarn build \
 && API_BASE=wotw.orirando.com API_SECURE=true yarn generate

# Stage 2
FROM nginx:1.19-alpine

COPY --from=build /app/dist /app
COPY ./docker/nginx/* /etc/nginx/conf.d/

WORKDIR /app

CMD nginx -g "daemon off;"

EXPOSE 80

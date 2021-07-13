# Stage 1
FROM node:alpine as build

ENV API_BASE_URL=/api

WORKDIR /app
COPY . /app
RUN yarn install \
 && yarn build \
 && yarn generate

# Stage 2
FROM nginx:1.19-alpine

COPY --from=build /app/dist /app
COPY ./docker/nginx/* /etc/nginx/conf.d/

WORKDIR /app

CMD nginx -g "daemon off;"

EXPOSE 80

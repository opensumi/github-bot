# syntax=docker/dockerfile:1

FROM node:18-alpine

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
COPY . /app
CMD yarn build:node
ENV PORT 8080
EXPOSE 8080

CMD [ "node", "dist/node/index.js" ]

# syntax=docker/dockerfile:1
FROM node:18-slim AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . /app
RUN yarn build:node

FROM node:18-slim AS runner
WORKDIR /app

COPY --from=deps /app/dist/node/ .

ENV NODE_ENV production

ENV PORT 8080
EXPOSE 8080

CMD [ "node", "index.js" ]

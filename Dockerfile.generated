FROM node:18.19 as build

ENV PORT=8080
WORKDIR /src

# Check if we have 'corepack' available; if none, we
# install corepack@0.10.0.
RUN which corepack || npm install -g --force corepack@0.10.0
RUN corepack enable

COPY . .
RUN yarn install

COPY . .

# Build if we can build it
RUN yarn build:node

EXPOSE 8080
CMD node dist/node/index.js

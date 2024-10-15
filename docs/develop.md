# Develop

## Using Node.js

configure cloudflare related env:

```env
CLOUDFLARE_AUTH_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_NAMESPACE_ID=
```

and run:

```bash
yarn dev:node
```

and the server will start at `http://0.0.0.0:878`.

## Using Cloudflare Workers

First of all, you need to learn the concepts of [Cloudflare Workers](https://workers.dev).

It is recommended to use Github Codespaces to develop, because we can access the ports on Codespaces from the public network, which make debug easier.

and just run:

```sh
yarn wrangler login
yarn dev
```

Then you should see the [how-to-use.md](./how-to-use.md).

## Use smee.io to test

You can use [smee.io](https://smee.io/) to test the webhook locally.

```sh
yarn dev:proxy
```

then you can get the webhook url, and set the webhook url in the GitHub repository settings.

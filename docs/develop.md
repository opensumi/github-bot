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
yarn watch:node

```

## Using Cloudflare Workers

First of all, you need to learn the concepts of [Cloudflare Workers](https://workers.dev).

It is recommended to use Github Codespaces to develop, because we can access the ports on Codespaces from the public network, which make debug easier.

and just run:

```sh
yarn global add wrangler
yarn
# Login to Cloudflare
wrangler login
yarn dev
```

Then you should see the [how-to-use.md](./how-to-use.md).

# Deploy

Firstly, we should prepare all the secrets we need(which listed in [`scripts/secrets.ts`](https://github.com/opensumi/github-bot/blob/b237a1e35c8fd5fdf720a88f911691f1e096f78c/scripts/secrets.ts)).

and save them to the KV store.

When we run the command: `yarn dev`, we will use `local` environment.

## Deploy from local machine

All you need to do is to have a Cloudflare account, then:

```sh
yarn
yarn wrangler login
yarn run publish:local
```

because we set `name` attribute in `wrangler.toml`, so this func will be deploy at:

```txt
https://{name}.{user}.workers.dev
```

and you can deploy to different domain by pass the `env` parameter.

## Deploy from GitHub Actions

Open the GitHub Actions Workflow page: <https://github.com/opensumi/github-bot/actions/workflows/deploy.yml>

click the `Run workflow` button, then input the [deploy environment](https://developers.cloudflare.com/workers/platform/environments), dev or prod。

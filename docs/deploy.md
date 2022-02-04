# Deploy

Firstly, we should prepare all the secrets we need(which listed in [`scripts/secrets.ts`](https://github.com/opensumi/github-webhook-handler/blob/b237a1e35c8fd5fdf720a88f911691f1e096f78c/scripts/secrets.ts)).

We use [`wrangler secrets`](https://developers.cloudflare.com/workers/cli-wrangler/commands#secret) manage the secrets, Cloudflare Workers will replace them in code when each execute.

> The thinking about `wrangler secrets` can see: <https://blog.cloudflare.com/workers-secrets-environment/>
>
> Rotating a set of API keys shouldn’t require risking downtime through code edits and redeployments and in some cases it may not make sense for the developer writing the script to know the actual API key value at all.

copy `.env.example` to `.env`, and set the corresponding value. then we can run `yarn sync-secrets` put the secrets to cloudflare。

> if you want set secrets on specific environment, you need create a file named `.env.{environment}`(like `.env.prod`), and run `yarn sync-secrets --env prod`。

We have three enviorments: `local`, `dev` and `prod`. They are defined in `wrangler.toml`.

> More info can be found in: <https://developers.cloudflare.com/workers/platform/environments>

When we run the command: `yarn dev`, we will use `local` environment.

## Deploy from local machine

All you need to do is to have a Cloudflare account, then:

```sh
yarn
yarn wrangler login
yarn run publish:local
```

because we set `name` attribute in `wrangler.toml`，so this func will be depolyed in：

```txt
https://{name}.{user}.workers.dev
```

and you can deploy to different domain by pass the `env` parameter.

## Deploy from GitHub Actions

Open the GitHub Actions Workflow page: <https://github.com/opensumi/github-bot/actions/workflows/deploy.yml>

click the `Run workflow` button, then input the [deploy environment](https://developers.cloudflare.com/workers/platform/environments)，dev or prod。

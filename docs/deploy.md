# Deploy

## Deploy to CloudFlare Workers

When deploy to CloudFlare Workers, you need to setup the Queue and KV first.

Do not worry, this is very easy, you can follow the steps below:

### Create a Queue

Follow the instructions in the [CloudFlare documentation](https://developers.cloudflare.com/queues/) to create a Queue.

When creating the Queue, you need to set the `Queue Name`, and then set it to `QUEUE_NAME_PROD` environment variable.

### Create a KV

Follow the instructions in the [CloudFlare documentation](https://developers.cloudflare.com/kv/) to create a KV.

When creating the KV, you need to set the `KV Namespace ID`, and then set it to `KV_PROD_ID` environment variable.

### Deploy from GitHub Actions

We already write a GitHub Actions Workflow in the `.github/workflows/deploy.yml`, you should set the environment variables in the GitHub Secrets, open <https://github.com/opensumi/github-bot/settings/secrets/actions> to set the environment variables:

```bash
# deploy related
CF_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=

# runtime related
KV_PROD_ID=
QUEUE_NAME_PROD=
```

Open the GitHub Actions Workflow page: <https://github.com/opensumi/github-bot/actions/workflows/deploy.yml>

click the `Run workflow` button, then input the [deploy environment](https://developers.cloudflare.com/workers/platform/environments), dev or prod。


## Deploy by docker

We already write a `Dockerfile` in the workspace folder, you can build the docker image by running the command:

```bash
docker build -t github-bot .
```

then you can run the docker image by running the command:

```bash
docker run -p 8080:8080 github-bot
```

You should set the environment variables in the docker run command, like:

```bash
CLOUDFLARE_AUTH_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_NAMESPACE_ID=
HOST=
```

Because we use the `cloudflare workers kv` to store the secrets, you should set the `CLOUDFLARE_AUTH_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_NAMESPACE_ID` to the docker container.

## Deploy by pm2

We already write a `ecosystem.config.js` in the workspace folder, you can run the command:

```bash
pm2 start ecosystem.config.js
```

then you can see the logs by running the command:

```bash
pm2 logs
```

and you also need to set the environment variables before you launch the pm2 process.

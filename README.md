# github-bot

这是一个部署在 [Cloudflare Workers](https://workers.dev) 上的 Serverless 函数。

## 开发

推荐使用 Github Codespaces 进行开发，因为在 Codespaces 上监听的端口可以直接从公网访问，可以方便的将这个公网链接用来测试。

```sh
yarn
yarn dev
```

## 本地部署

部署非常简单，你需要做的就是有一个 Cloudflare 帐号，然后执行：

```sh
yarn
yarn wrangler login
yarn run publish:local
```

因为我们在 `wrangler.toml` 中配置了 `name: sumi-worker-dev`，所以本应用会被部署在：

```txt
https://sumi-worker-dev.{user}.workers.dev
```

然后可以在 Cloudflare Workers 的后台上配置自定义域名。

最后将这个域名配置在该使用的地方即可。

你也可以指定 [部署环境](https://developers.cloudflare.com/workers/platform/environments)，这些值配置在了 `wrangler.toml` 中，如：

```sh
yarn run publish:local --env prod
```

这时候应用会部署在：

```txt
https://sumi-worker.{user}.workers.dev
```

## 如何使用

### 配置密钥项

把这些项设置在环境变量中。

1. DINGTALK_SECRET
   创建机器人时选择加签模式，会出现这个加签密钥。
2. DINGTALK_WEBHOOK_URL
   钉钉的 webhook 地址。
3. SELF_GITHUB_WEBHOOK_SECRET
   Github 后台设置 webhooks 时设置的 secret

本地部署/调试时可以通过 `.env` 来配置这三项。
在 Github Actions 上可以通过设置 secrets 来配置这些变量。

### 配置 Github Webhook

打开 `https://github.com/opensumi/core/settings/hooks/new`，

1. 将部署后的地址：`https://sumi-worker-dev.{user}.workers.dev/gh_webhook` 填入 `Payload URL`
2. `Content type` 选择 `application/json`
3. `Secret` 填写和 [配置密钥项](#配置密钥项) 中 `SELF_GITHUB_WEBHOOK_SECRET` 一样的值。
4. `events` 选择 `Send me everything.`

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

因为我们在 `wrangler.toml` 中配置了 `name: sumi-local`，所以本应用会被部署在：

```txt
https://sumi-local.{user}.workers.dev
```

然后可以在 Cloudflare Workers 的后台上配置自定义域名。

最后将这个域名配置在该使用的地方即可。

## 正式部署

打开 Workflow 页面：<https://github.com/opensumi/github-bot/actions/workflows/deploy.yml>

点击 Run workflow 后可以选择 [部署环境](https://developers.cloudflare.com/workers/platform/environments)，dev 或者 prod。

这两个环境的区别就是部署域名不同，`ENVIRONMENT` 变量的值不同（都配置在了 `wrangler.toml` 中）。

默认部署的地址为：`https://sumi-local.{user}.workers.dev`  
dev 部署的地址为：`https://sumi-dev.{user}.workers.dev`  
prod 部署的地址为：`https://sumi.{user}.workers.dev`  

我们就可以设置不同的路由到不同的路径来区分环境。

比如：

`https://dev.bot.xx.com` -> `https://sumi-dev.{user}.workers.dev`  
`https://bot.xx.com` -> `https://sumi.{user}.workers.dev`  

## 如何使用

### 配置密钥项

所有密钥都是通过 [`wrangler secrets`](https://developers.cloudflare.com/workers/cli-wrangler/commands#secret) 来管理的。

以后我们改变密钥时，就不需要再部署一遍代码，而是直接修改 Secrets 即可。

将 `.env.example` 复制一份为 `.env`，配置里面的内容。

1. DINGTALK_SECRET
   创建机器人时选择加签模式，会出现这个加签密钥。
2. DINGTALK_WEBHOOK_URL
   钉钉的 webhook 地址。
3. DINGTALK_OUTGOING_TOKEN
   启用钉钉的 outgoing 机制时要设置的 token。
4. GH_WEBHOOK_SECRET
   Github 后台设置 webhooks 时设置的 secret

然后执行 `yarn setup-secrets` 将这些密钥同步到 Cloudflare 环境中。

如果想配置线上环境的密钥，需要创建一个 `.env.prod` 文件，然后执行 `yarn setup-secrets --env prod` 即可。

### 配置 Github Webhook

打开 `https://github.com/opensumi/core/settings/hooks/new`，

1. 将部署后的地址：`https://bot.xx.com/gh_webhook` 填入 `Payload URL`
2. `Content type` 选择 `application/json`
3. `Secret` 填写和 [配置密钥项](#配置密钥项) 中 `GH_WEBHOOK_SECRET` 一样的值。
4. `events` 选择 `Send me everything.`

### 配置 Dingtalk Webhook

路径：群设置 -> 智能群助手 -> 添加机器人 -> 自定义机器人

设置好机器人名字，头像。

安全设置选择 `加签`，将这个值设置到 [配置密钥项](#配置密钥项) 的 `DINGTALK_SECRET`。

勾选 **是否开启 Outgoing 机制**，POST 地址填入：

```txt
https://bot.xx.com/ding_webhook
```

Token 填入 [配置密钥项](#配置密钥项) 的 `DINGTALK_OUTGOING_TOKEN` 值。

### 配置 Github App

如果想开启 Github App 模式的话，需要先配置以下的 Secrets：

- GH_APP_ID  
  创建的 Github App 的 ID
- GH_APP_WEBHOOK_SECRET  
  在 Github App 中设置 webhooks 地址时设置的 secret
- GH_APP_PRIVATE_KEY  
  在 Github App 中生成一个 private key，纯文本就好，换行使用 `\n`，如果使用 actions 直接多行粘贴即可。

然后打开你的 Github App 开发页面，设置 webhooks 地址为：

```txt
https://bot.xx.com/gh_app
```

Github 下载的 private key 要转一下格式：

```txt
// https://github.com/gr2m/cloudflare-worker-github-app-example/blob/main/worker.js

// The private-key.pem file from GitHub needs to be transformed from the
// PKCS#1 format to PKCS#8, as the crypto APIs do not support PKCS#1:
//
//     openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem
//
// The private key is too large, so we split it up across 3 keys.
// You can split up the *.pem file into 3 equal parts with
//
//     split -l 3 private-key-pkcs8.pem
//
// Then set the priveat keys
//
//     cat xaa | wrangler secret put PRIVATE_KEY_1
//     cat xab | wrangler secret put PRIVATE_KEY_2
//     cat xac | wrangler secret put PRIVATE_KEY_3
```

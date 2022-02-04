# How to use?

First we should set the secrets: [Secrets](./secrets.md).

Assure our worker is deployed on: <https://worker.bot/>

## Configure Github Webhook

Open `https://github.com/opensumi/core/settings/hooks/new`，

1. `Payload URL`: Input `https://worker.bot/gh_webhook`
2. `Content type`: Select `application/json`
3. `Secret`: Input the secret you set([Secrets](./secrets.md) > `GH_WEBHOOK_SECRET`)。
4. `events`: Select `Send me everything.`

### Configure Dingtalk Webhook

Open: Group Settings(群设置) -> 智能群助手 -> 添加机器人 -> 自定义机器人

And set the bot's name, avatar.

Select `加签` in `安全设置`, and set the value to [Secrets](./secrets.md) > `DINGTALK_SECRET`.

Check the radio: **是否开启 Outgoing 机制**,

input the worker's address to `POST 地址`：

```txt
https://worker.bot/ding_webhook
```

The outgoing `Token` should be set in [Secrets](./secrets.md) > `DINGTALK_OUTGOING_TOKEN`.

### Configure Github App

First you need to create a GitHub App, in the settings:

set `webhooks` to：

```txt
https://worker.bot/gh_app
```

set `secret` to the value you set([Secrets](./secrets.md) > `GH_APP_WEBHOOK_SECRET`)。

When create bot done, you can get the last two secrets you need:

set **App ID** to [Secrets](./secrets.md) > `GH_APP_ID`

and generate a private key. and set it's value to [Secrets](./secrets.md) > `GH_APP_PRIVATE_KEY`.

Notice, we should transform the format of private key：

```txt
// https://github.com/gr2m/cloudflare-worker-github-app-example/blob/main/worker.js

// The private-key.pem file from GitHub needs to be transformed from the
// PKCS#1 format to PKCS#8, as the crypto APIs do not support PKCS#1:
//
//     openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem
```
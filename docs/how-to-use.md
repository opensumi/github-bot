# How to use?

Assure our worker is deployed on: <https://worker.bot/>

Firstly is set a admin password, just visit: <https://worker.bot//admin/initialize?newToken=password> to set a password.

Select a id for your project, for example: `opensumi-core`.

and visit <https://worker.bot/configuration/opensumi-core> to configure your project.

if you want set a token for `opensumi-core`, 
you can visit <https://worker.bot/admin/configure-scope?adminToken=password&scope=opensumi-core&token=p1> to set a token.

## Configure Github Webhook

You need configure a secret in <https://worker.bot/configuration/opensumi-core/setting> first:

Open `https://github.com/opensumi/core/settings/hooks/new`:

1. `Payload URL`: Input `https://worker.bot/webhook/opensumi-core`
2. `Content type`: Select `application/json`
3. `Secret`: Input the secret you want to set.
4. `events`: Select `Send me everything.`

### Configure Dingtalk Webhook

Open: Group Settings(群设置) -> 智能群助手 -> 添加机器人 -> 自定义机器人

And set the bot's name, avatar.

Select `加签` in `安全设置`, [HERE IS A SECRET].

Check the radio: **是否开启 Outgoing 机制**,

input the worker's address to `POST 地址`：

```txt
https://worker.bot/ding/opensumi-core
```

The outgoing `Token` should be set in <https://worker.bot/configuration/opensumi-core/ding-setting>.

### Configure Github App

First you need to create a GitHub App, in the GitHub website:

set `webhooks` to：

```txt
https://worker.bot/github/app/opensumi-core
```

set `secret` to the value you seted in <https://worker.bot/configuration/opensumi-core/app-settings>

When create bot done, you can get **App ID** and **private key**,
but you need to transform the format of private key to PKCS#8 format, you can use this command：

```sh
// https://github.com/gr2m/cloudflare-worker-github-app-example/blob/main/worker.js

// The private-key.pem file from GitHub needs to be transformed from the
// PKCS#1 format to PKCS#8, as the crypto APIs do not support PKCS#1:

openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem
```

Then you can set the configuration in <https://worker.bot/configuration/opensumi-core/app-settings>.

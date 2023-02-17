# How to use?

First we should set the secrets: [Secrets](./secrets.md).

Assure our worker is deployed on: <https://worker.bot/>

## Configure Github Webhook

Open `https://github.com/opensumi/core/settings/hooks/new`:

1. `Payload URL`: Input `https://worker.bot/webhook/opensumi-core`
2. `Content type`: Select `application/json`
3. `Secret`: Input the secret you want to set, [HERE IS A SECRET]。
4. `events`: Select `Send me everything.`

### Configure Dingtalk Webhook

Open: Group Settings(群设置) -> 智能群助手 -> 添加机器人 -> 自定义机器人

And set the bot's name, avatar.

Select `加签` in `安全设置`, [HERE IS A SECRET].

Check the radio: **是否开启 Outgoing 机制**,

input the worker's address to `POST 地址`：

```txt
https://worker.bot/ding/xxx
```

The outgoing `Token` should be set in [KVManager](./kv.md), [HERE IS A SECRET].

### Configure Github App

First you need to create a GitHub App, in the settings:

set `webhooks` to：

```txt
https://worker.bot/gh_app
```

set `secret` to the value you set([Secrets](./secrets.md), [HERE IS A SECRET])。

When create bot done, you can get the last two secrets you need:

set **App ID** to [Secrets](./secrets.md), [HERE IS A SECRET]

and generate a private key. and set it's value to [Secrets](./secrets.md), [HERE IS A SECRET].

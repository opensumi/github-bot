# Configurations

We use the KV to store some configuration.

## Webhooks Configuration

```js
{
  "release": {
    "githubSecret": "secret",
    "notDisplayRepoName": false,
    "dingWebhooks": [
      {
        "secret": "xxx",
        "url": "xxxx",
        "": "this is a comments"
      },
      {
        "url": "xxxxs",
        "": "this is a comments"
      }
    ],
    "event": ["release.released"]
  }
}

```

## GitHub App Configuration

```js
{
    "appSettings": {
        "appId": "123123",
        "privateKey": "xxxxxx"
    },
    "githubSecret": "asdasd",
    "dingWebhooks": [
        {
            "url": "xxxxxxx"
        },
    ],
    "contentLimit": 300,
    "notDisplayRepoName": true
}
```

Notice, we should transform the format of private key：

```sh
// https://github.com/gr2m/cloudflare-worker-github-app-example/blob/main/worker.js

// The private-key.pem file from GitHub needs to be transformed from the
// PKCS#1 format to PKCS#8, as the crypto APIs do not support PKCS#1:

openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem
```

## Ding Bot Configuration

```json
{
  "ding/secrets/xxx": {
    "outGoingToken": "xxxxx"
  },
  "ding/info/xxx": {}
}
```

You need set your bot outGoingToken to KV Namespace, key is `ding/secrets/xxx` xxx is you post url path.

> eg. post url: https://worker.bot/ding/test key: ding/secrets/test

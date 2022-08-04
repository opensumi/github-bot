# Workers KV

We use the Workers KV to store some configuration.

## Create KV Namespace

You need to create a KV Namepsace, and set it's id in the `.env` file:

```dotenv
KV_LOCAL_ID=xxxx
KV_PROD_ID=xxxxx
```

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

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
        "secret": "xxxx",
        "url": "xxxxs",
        "": "this is a comments"
      }
    ],
    "event": ["release.released"]
  }
}

```

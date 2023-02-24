# ChatGPT

> As noted in <https://github.com/transitive-bullshit/chatgpt-api>

Uses an unofficial proxy server to access ChatGPT's backend API in a way that circumvents Cloudflare (uses the real ChatGPT and is pretty lightweight, but relies on a third-party server and is rate-limited)

## Reverse Proxy

You can override the reverse proxy in conversation-related KV:

```ts
// ding/conversation/settings/{conversationId}
{
    "apiReverseProxyUrl": "xxxxxx"
}
```

Known reverse proxies run by community members include:

| Reverse Proxy URL                                | Author                                       | Rate Limits      | Last Checked |
| ------------------------------------------------ | -------------------------------------------- | ---------------- | ------------ |
| `https://chat.duti.tech/api/conversation`        | [@acheong08](https://github.com/acheong08)   | 40 req/min by IP | 2/19/2023    |
| `https://gpt.pawan.krd/backend-api/conversation` | [@PawanOsman](https://github.com/PawanOsman) | ?                | 2/19/2023    |

Note: info on how the reverse proxies work is not being published at this time in order to prevent OpenAI from disabling access.

## Update `access_token`

To use `ChatGPTUnofficialProxyAPI`, you'll need an OpenAI access token from the ChatGPT webapp. You can either:

1. Use [acheong08/OpenAIAuth](https://github.com/acheong08/OpenAIAuth), which is a python script to login and get an access token automatically. This works with email + password accounts (e.g., it does not support accounts where you auth via Microsoft / Google).

2. You can manually get an `accessToken` by logging in to the ChatGPT webapp and then opening `https://chat.openai.com/api/auth/session`, which will return a JSON object containing your `accessToken` string.

Access tokens last for ~8 hours.

**Note**: using a reverse proxy will expose your access token to a third-party. There shouldn't be any adverse effects possible from this, but please consider the risks before using this method.

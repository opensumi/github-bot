import { GitHubKVManager } from '@/kv/github';

export function route(hono: THono) {
  hono.get('/auth/github/:id', async (c) => {
    const kv = await GitHubKVManager.instance().getOauthAppConfig(c.req.param('id'));
    if (!kv) {
      return c.html('error', 500);
    }

    // 重定向到 github 登录页面
    // 透传 state 参数，用于登录后重定向到原始页面
    // state: originalState|originalUrl
    return c.redirect(
      `https://github.com/login/oauth/authorize?client_id=${kv.clientId}&scope=read:user%20repo&state=${c.req.query(
        'state'
      )}`
    );
  });

  hono.get('/auth/github/callback/:id', async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const kv = await GitHubKVManager.instance().getOauthAppConfig(c.req.param('id'));
    if (!kv) {
      return c.html('error', 500);
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: kv.clientId,
        client_secret: kv.clientSecret,
        code,
      }),
    })
      .then((res) => res.json<{ access_token: string }>())
      .catch((err) => {
        console.log('request github error: ', err);
      });

    if (res && state) {
      const [, originalUrl] = state.split('|');
      // 获取 state 参数，重定向到原始页面
      // 携带 access_token 参数，前端自行缓存后请求
      return c.redirect(`${originalUrl}?access_token=${res.access_token}`);
    }

    return c.html('error', 500);
  });
}

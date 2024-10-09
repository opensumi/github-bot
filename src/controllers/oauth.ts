import { GitHubDAO } from '@/dao/github';

export function route(hono: THono) {
  hono.get('/auth/callback/:id', async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    const config = await GitHubDAO.instance().getOauthAppConfig(
      c.req.param('id'),
    );

    if (!config) {
      return c.html('error', 500);
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
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

  hono.get('/auth/github/:id', async (c) => {
    const config = await GitHubDAO.instance().getOauthAppConfig(
      c.req.param('id'),
    );

    if (!config) {
      return c.html('error', 500);
    }

    // 重定向到 github 登录页面
    // 透传 state 参数，用于登录后重定向到原始页面
    // state: originalState|originalUrl
    return c.redirect(
      `https://github.com/login/oauth/authorize?client_id=${
        config.clientId
      }&scope=read:user%20repo&state=${c.req.query('state')}`,
    );
  });
}

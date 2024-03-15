export function route(hono: THono) {
  hono.get('/auth/github', async (c) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    // Redirect to GitHub OAuth
    // state: originalState|originalUrl
    return c.redirect(
      `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user%20repo&state=${c.req.query('state')}`,
    );
  });

  hono.get('/auth/github/callback', async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
      .then((res) => res.json<{ access_token: string }>())
      .catch((err) => {
        console.log('request github error: ', err);
      });

      if (res && state) {
      const [originalState, originalUrl] = state.split('|');
      return c.redirect(
        `${originalUrl}?access_token=${res.access_token}`,
      );
    }

    return c.html('error', 500);
  });
}

export function getURL(_url: string) {
  try {
    return new URL(_url);
  } catch (error) {
    return undefined;
  }
}
export function route(hono: THono) {
  hono.all('/proxy/:url', async (c) => {
    const _url = c.req.param('url') ?? c.req.query('url');
    if (_url) {
      const candidates = [_url, decodeURIComponent(_url)]
        .map(getURL)
        .filter(Boolean);

      if (candidates.length > 0 && candidates[0]) {
        const url = candidates[0];
        return fetch(url.toString(), c.req as any);
      }
    }
    return c.send.error(401, 'not a valid hostname');
  });
}

import OpenSumiRunHTML from '@/public/opensumirun/index.html';

export function route(hono: THono) {
  hono.get('/opensumi/run', async (c) => {
    return c.html(OpenSumiRunHTML, 200);
  });
}

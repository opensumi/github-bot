export function route(hono: THono) {
  hono.get('/', (c) => {
    return c.redirect('/opensumi/core');
  });
}

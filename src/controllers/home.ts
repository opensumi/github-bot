import html from '../public/index.html';

export function route(hono: THono) {
  hono.get('/', (c) => c.html(html));
}

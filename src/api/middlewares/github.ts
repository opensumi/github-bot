import { assert } from '@/api/utils/assert';
import { ValidationError } from '@/github';

export function middleware(hono: THono) {
  hono.use('/github/*', async (c, next) => {
    const headers = c.req.headers;

    assert(
      headers.get('User-Agent')?.startsWith('GitHub-Hookshot/'),
      new ValidationError(403, 'User agent: not from GitHub'),
    );
    assert(
      headers.get('x-github-event'),
      new ValidationError(400, 'Required headers: x-github-event'),
    );
    assert(
      headers.get('x-hub-signature-256'),
      new ValidationError(400, 'Required headers: x-hub-signature-256'),
    );
    assert(
      headers.get('x-github-delivery'),
      new ValidationError(400, 'Required headers: x-github-delivery'),
    );

    await next();
  });
}

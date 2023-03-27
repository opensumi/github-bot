import { assert } from '@/api/utils/assert';
import { ValidationError } from '@/github';

import { objectRequired } from '../utils/validator';

export function middleware(hono: THono) {
  hono.use('/github/app/*', async (c, next) => {
    const headers = c.req.headers;

    assert(
      headers.get('User-Agent')?.startsWith('GitHub-Hookshot/'),
      new ValidationError(403, 'User agent: not from GitHub'),
    );

    objectRequired(headers, 'Headers', [
      'x-github-event',
      'x-hub-signature-256',
      'x-github-delivery',
    ]);

    await next();
  });
}

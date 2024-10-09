import { ValidationError } from '@/services/github';
import { assert } from '@/utils/api/assert';

import { objectRequired } from '@/utils/api/validator';

export function middleware(hono: THono) {
  hono.use('/github/app/*', async (c, next) => {
    const headers = c.req.raw.headers;

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

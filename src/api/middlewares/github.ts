import { z } from 'zod';

import { assert } from '@/api/utils/assert';
import { ValidationError } from '@/github';

const GitHubEvent = z.object({
  'x-github-event': z.string(),
  'x-hub-signature-256': z.string(),
  'x-github-delivery': z.string(),
});

export function middleware(hono: THono) {
  hono.use('/github/*', async (c, next) => {
    const headers = c.req.headers;

    assert(
      headers.get('User-Agent')?.startsWith('GitHub-Hookshot/'),
      new ValidationError(403, 'User agent: not from GitHub'),
    );
    assert(
      headers.get('Content-Type') === 'application/json',
      new ValidationError(415, 'Content type: not json'),
    );
    try {
      GitHubEvent.parse(c.req.headers);
    } catch (error) {
      console.log(`🚀 ~ file: github.ts:28 ~ hono.use ~ error`, error);
      throw error;
    }

    await next();
    c.header('x-message', 'This is middleware!');
  });
}

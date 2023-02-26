import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { ValidationError } from '@/github';

import favicon from '../public/favicon.svg';
import html from '../public/index.html';

import { registerBlueprint } from './controllers';
import { applyMiddleware } from './middleware';

export function ignition(hono: THono) {
  hono.use('*', async (c, next) => {
    const waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);
    c.executionCtx.waitUntil = (promise) => {
      return waitUntil(
        (async () => {
          try {
            await promise;
          } catch (err) {
            console.log('waitUntil error', err);
          }
          console.log('wait until complete');
        })(),
      );
    };

    await next();
  });

  hono.use('*', logger());
  hono.use('*', prettyJSON());

  hono.get('/', (c) => c.html(html));

  hono.get('/favicon.ico', async (c) => {
    return c.body(favicon, 200, {
      'content-type': 'image/svg+xml',
    });
  });

  applyMiddleware(hono);
  registerBlueprint(hono);

  hono.notFound((c) => {
    return c.send.error(404, 'no router found');
  });

  hono.onError((err, c) => {
    console.error('onError', err);
    if (err instanceof ValidationError) {
      return c.send.error(err.code, 'github validation error ' + err.message);
    }

    return c.send.error(500, 'server internal error');
  });
}

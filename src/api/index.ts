import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { StatusCode } from 'hono/utils/http-status';
import { Toucan } from 'toucan-js';

import { ValidationError } from '@/github';

import favicon from '../public/favicon.svg';
import html from '../public/index.html';

import { registerBlueprint } from './controllers';
import { useMiddleware } from './middlewares';

export function ignition(hono: THono) {
  hono.use('*', async (c, next) => {
    if (c.env.SENTRY_DSN) {
      const sentry = new Toucan({
        dsn: c.env.SENTRY_DSN,
        context: c.executionCtx,
        request: c.req,
      });
      c.sentry = sentry;

      const waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);
      c.executionCtx.waitUntil = (promise) => {
        waitUntil(
          (async () => {
            try {
              await promise;
            } catch (err) {
              sentry.captureException(err);
            }
          })(),
        );
      };
    }

    await next();
  });

  hono.use('*', logger());
  hono.use('*', prettyJSON());
  hono.use('*', async (c, next) => {
    c.send = {
      error: (
        status: StatusCode | number = 500,
        content = 'Internal Server Error.',
      ) => {
        return c.json(
          {
            status,
            error: content,
          },
          status as StatusCode,
        );
      },
      message: (text: string) => {
        return c.json({
          message: text,
        });
      },
    };
    await next();
  });

  hono.get('/', (c) => c.html(html));

  hono.get('/favicon.ico', async (c) => {
    return c.body(favicon, 200, {
      'content-type': 'image/svg+xml',
    });
  });

  useMiddleware(hono);
  registerBlueprint(hono);

  hono.notFound((c) => {
    return c.send.error(404, 'no router found');
  });

  hono.onError((err, c) => {
    console.error(err);
    c.sentry?.captureException(err);
    if (err instanceof ValidationError) {
      return c.send.error(err.code, 'github validation error ' + err.message);
    }

    return c.send.error(500, 'server internal error');
  });
}

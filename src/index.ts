import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import Toucan from 'toucan-js';
import { ignition } from '@/modules';
import favicon from './public/favicon.html';
import html from './public/index.html';

const app = new Hono() as THono;

app.use('*', async (c, next) => {
  if (c.env.SENTRY_DSN) {
    const sentry = new Toucan({
      dsn: c.env.SENTRY_DSN,
      context: c.executionCtx,
      request: c.req,
      allowedHeaders: ['user-agent'],
      allowedSearchParams: /(.*)/,
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

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', async (c, next) => {
  c.error = (status = 500, content = 'Internal Server Error.') => {
    return c.json(
      {
        status,
        error: content,
      },
      status,
    );
  };
  c.message = (text: string) => {
    return c.json({
      message: text,
    });
  };
  await next();
});

app.get('/', (c) => c.html(html));

app.get('/favicon.ico', async (c) => {
  return c.body(favicon, 200, {
    'content-type': 'image/svg+xml',
  });
});

ignition(app);

app.notFound((c) => {
  return c.error(404, 'no router found');
});

app.onError((err, c) => {
  console.error(err);
  c.sentry?.captureException(err);
  return c.error(500, 'server internal error');
});

export default app;

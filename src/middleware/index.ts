import { StatusCode } from 'hono/utils/http-status';

import * as GitHub from './github';

export function applyMiddleware(hono: THono) {
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
        })(),
      );
    };

    await next();
  });

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
    } as ISend;

    await next();
  });
  GitHub.middleware(hono);
}

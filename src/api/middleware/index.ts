import { StatusCode } from 'hono/utils/http-status';

import * as GitHub from './github';

export const enhanceContext = (hono: THono) => {
  hono.use('*', async (c, next) => {
    const url = new URL(c.req.url);
    const origin = `${url.origin}/`;
    c.origin = origin;
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
};

export function applyMiddleware(hono: THono) {
  enhanceContext(hono);

  GitHub.middleware(hono);
}

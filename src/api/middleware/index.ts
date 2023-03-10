import { StatusCode } from 'hono/utils/http-status';

import * as GitHub from './github';

export interface ISend {
  error(status: StatusCode | number, content: string): Response;
  message(text: string): Response;
}

export const enhanceContext = (hono: THono) => {
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
};

export function applyMiddleware(hono: THono) {
  enhanceContext(hono);

  GitHub.middleware(hono);
}

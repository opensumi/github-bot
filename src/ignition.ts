import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { prettyJSON } from 'hono/pretty-json';

import { ValidationError } from '@/services/github';

import { registerControllers } from './controllers';
import { dispatch } from './gateway';
import { applyMiddleware } from './middleware';
import { logger } from './middleware/logger';

export function ignition() {
  const hono = new Hono({
    getPath: dispatch,
  }) as THono;

  applyMiddleware(hono);

  hono.use('*', logger());
  hono.use('*', prettyJSON());

  registerControllers(hono);

  hono.notFound((c) => {
    return c.send.error(404, 'no router found');
  });

  hono.onError((err, c) => {
    console.error('onError', err);
    if (err instanceof ValidationError) {
      return c.send.error(
        err.statusCode,
        'github validation error ' + err.message,
      );
    }
    if (err instanceof HTTPException) {
      return c.send.error(err.status, err.message);
    }
    return c.send.error(500, 'server internal error');
  });

  return hono;
}

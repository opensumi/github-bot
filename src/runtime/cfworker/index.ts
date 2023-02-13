import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';
import { RequiredField } from '@/types';

const app = new Hono() as THono;

ignition(app);

export default {
  ...app,
  fetch: async (request: Request, env: IRuntimeEnv, ctx: ExecutionContext) => {
    Environment.from(env);

    return app.fetch(request, env, ctx);
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch'>;

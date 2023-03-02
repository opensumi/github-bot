import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';
import { RequiredField } from '@/types';

const app = new Hono<{ Bindings: IRuntimeEnv }>() as THono;

ignition(app);

export default {
  ...app,
  fetch: async (request: Request, env: IRuntimeEnv, ctx: ExecutionContext) => {
    Environment.from('cloudflare', env);

    return app.fetch(request, env, ctx);
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch'>;

import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';
import { consumer } from '@/queue';
import { TQueueMessage } from '@/queue/types';
import { RequiredField } from '@/types';

const app = new Hono<{ Bindings: IRuntimeEnv }>() as THono;

ignition(app);

export default {
  fetch: async (request: Request, env: IRuntimeEnv, ctx: ExecutionContext) => {
    Environment.from('cfworker', env);
    Environment.instance().useQueue = true;
    return app.fetch(request, env, ctx);
  },
  async queue(
    batch: MessageBatch<TQueueMessage>,
    env: IRuntimeEnv,
    ctx: ExecutionContext,
  ) {
    Environment.from('cfworker', env);

    const messages = batch.messages;
    messages.forEach((message) => {
      consumer.consume(message, env, ctx);
    });
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch' | 'queue'>;

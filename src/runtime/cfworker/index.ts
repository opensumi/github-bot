import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';
import { createConsumer } from '@/queue';
import { TQueueMessage } from '@/queue/types';
import { RequiredField } from '@/types';

const app = new Hono<{ Bindings: IRuntimeEnv }>() as THono;

ignition(app);

export default {
  fetch: async (request: Request, env: IRuntimeEnv, ctx: ExecutionContext) => {
    Environment.from('cfworker', env);
    return app.fetch(request, env, ctx);
  },
  async queue(
    batch: MessageBatch<TQueueMessage>,
    env: IRuntimeEnv,
    ctx: ExecutionContext,
  ) {
    Environment.from('cfworker', env);

    const consumer = createConsumer();

    consumer.consume(...batch.messages);

    ctx.waitUntil(
      consumer
        .runAndWait()
        .then(() => {
          console.log('queue done');
        })
        .catch((err) => {
          console.log('queue error', err);
        }),
    );
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch' | 'queue'>;

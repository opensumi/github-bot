import { ignition } from '@/api';
import Environment from '@/env';
import { createConsumer } from '@/queue';
import { TQueueMessage } from '@/queue/types';
import { RequiredField } from '@/types';
import { Logger } from '@/utils/logger';

const app = ignition();

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
    const logger = Logger.instance();
    Environment.from('cfworker', env);

    const consumer = createConsumer();

    consumer.push(...batch.messages);

    ctx.waitUntil(
      consumer
        .runAndWait()
        .then((res) => {
          logger.info('queue done', res);
        })
        .catch((err) => {
          logger.error('queue error', err);
        }),
    );
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch' | 'queue'>;

import Environment, { als } from '@/env';
import { ignition } from '@/ignition';
import { createBatchConsumer } from '@/services/queue';
import { TQueueMessage } from '@/services/queue/types';
import { RequiredField } from '@/types';
import { Logger } from '@/utils/logger';

import { getHostOrigin } from '@/utils/req';
import { runtimeConfig } from './config';

const app = ignition();

export default {
  fetch: async (request: Request, env: IRuntimeEnv, ctx: ExecutionContext) => {
    const e = Environment.from(runtimeConfig, env, {
      origin: getHostOrigin(request),
    });
    return e.run(() => app.fetch(request, env, ctx));
  },
  async queue(
    batch: MessageBatch<TQueueMessage>,
    env: IRuntimeEnv,
    ctx: ExecutionContext,
  ) {
    const logger = Logger.instance();

    als.run(
      Environment.from(runtimeConfig, env, {
        origin: '',
      }),
      () => {
        const consumer = createBatchConsumer(batch);
        ctx.waitUntil(
          consumer
            .runAndAwait()
            .then((res) => {
              logger.info('queue done', res);
            })
            .catch((err) => {
              logger.error('queue error', err);
            }),
        );
      },
    );
  },
} as RequiredField<ExportedHandler<IRuntimeEnv>, 'fetch' | 'queue'>;

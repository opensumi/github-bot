import MultiMap from 'mnemonist/multi-map';

import { Logger } from '@/utils/logger';

import { TQueueMessage } from './types';
import { BaseWorker } from './worker';
import { GitHubAppWorker } from './worker/github';

export class QueueConsumer<T> {
  logger = Logger.instance();

  constructor(public env: IRuntimeEnv, public ctx: ExecutionContext) {}

  private workerMap = new MultiMap<string, BaseWorker<T>>();

  addWorker(type: string, worker: BaseWorker<T>) {
    this.workerMap.set(type, worker);
  }

  consume(...messages: Message<T>[]) {
    messages.forEach((v) => {
      this.logger.info('consume', v.body);
      for (const w of this.workerMap.values()) {
        w.consume(v);
      }
    });
  }

  async runAndWait() {
    const promises = [] as Promise<void>[];
    for (const w of this.workerMap.values()) {
      promises.push(w.run());
    }
    return await Promise.allSettled(promises);
  }
}

export const createConsumer = (env: IRuntimeEnv, ctx: ExecutionContext) => {
  const consumer = new QueueConsumer<TQueueMessage>(env, ctx);
  consumer.addWorker('github-app', new GitHubAppWorker(env, ctx));
  // consumer.addWorker('github-webhook', githubWebhookWorker);
  return consumer;
};

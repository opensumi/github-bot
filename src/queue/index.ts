import MultiMap from 'mnemonist/multi-map';

import { TQueueMessage } from './types';
import { BaseWorker } from './worker';
import { GitHubAppWorker } from './worker/github';

export class QueueConsumer {
  constructor(public env: IRuntimeEnv, public ctx: ExecutionContext) {}

  private workerMap = new MultiMap<
    TQueueMessage['type'],
    BaseWorker<TQueueMessage>
  >();

  addWorker<T extends TQueueMessage, K extends TQueueMessage['type']>(
    type: K,
    worker: BaseWorker<T>,
  ) {
    this.workerMap.set(type, worker);
  }

  consume(message: Message<TQueueMessage>) {
    for (const w of this.workerMap.values()) {
      w.consume(message);
    }
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
  const consumer = new QueueConsumer(env, ctx);
  consumer.addWorker('github-app', new GitHubAppWorker(env, ctx));
  // consumer.addWorker('github-webhook', githubWebhookWorker);
  return consumer;
};

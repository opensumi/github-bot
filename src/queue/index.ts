import MultiMap from 'mnemonist/multi-map';

import { Logger } from '@/utils/logger';

import { TQueueMessage } from './types';
import { BaseWorker } from './worker';
import { GitHubEventWorker } from './worker/github';

export class QueueConsumer<T extends { type: string }> {
  logger = Logger.instance();

  private workerMap = new MultiMap<string, BaseWorker<T>>();

  addWorker(type: string, worker: BaseWorker<T>) {
    this.workerMap.set(type, worker);
  }

  push(...messages: Message<T>[]) {
    for (const v of messages) {
      this.logger.info('consume', v.body);
      const workers = this.workerMap.get(v.body.type);
      if (!workers) {
        this.logger.error('no worker found for', v.body.type);
        return;
      }

      for (const worker of workers) {
        worker.push(v);
      }
    }
  }

  async runAndAwait() {
    const promises = [] as Promise<void>[];
    for (const w of this.workerMap.values()) {
      promises.push(w.run());
    }
    return await Promise.allSettled(promises);
  }
}

export const createConsumer = () => {
  const consumer = new QueueConsumer<TQueueMessage>();
  consumer.addWorker('github-app', new GitHubEventWorker('app'));
  consumer.addWorker('github-webhook', new GitHubEventWorker('webhook'));
  return consumer;
};

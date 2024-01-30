import MultiMap from 'mnemonist/multi-map';

import { Logger } from '@/utils/logger';

import { TQueueMessage } from './types';
import { BaseWorker } from './worker';
import { GitHubAppWorker } from './worker/github';

export class QueueConsumer<T> {
  logger = Logger.instance();

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

export const createConsumer = () => {
  const consumer = new QueueConsumer<TQueueMessage>();
  consumer.addWorker('github-app', new GitHubAppWorker());
  // consumer.addWorker('github-webhook', new GitHubWebHookWorker());
  return consumer;
};

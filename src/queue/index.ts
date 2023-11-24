import { EventEmitter } from 'eventemitter3';

import { TQueueMessage } from './types';
import { githubWorker } from './worker/github';

export type IConsumeWorker<T> = (
  message: Message<T>,
  env: IRuntimeEnv,
  ctx: ExecutionContext,
) => void;

export class QueueConsumer {
  private emitter = new EventEmitter();
  addWorker<T, K extends TQueueMessage['type']>(
    type: K,
    handler: IConsumeWorker<T>,
  ) {
    this.emitter.on(type, handler);
  }

  consume(
    message: Message<TQueueMessage>,
    env: IRuntimeEnv,
    ctx: ExecutionContext,
  ) {
    const { body } = message;
    const { type } = body;

    this.emitter.emit(type, message, env, ctx);
  }
}

export const consumer = new QueueConsumer();
consumer.addWorker('github-app', githubWorker);

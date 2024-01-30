import { EventEmitter } from 'eventemitter3';

export abstract class BaseWorker<T> {
  protected emitter = new EventEmitter();

  queue: Message<T>[] = [];

  push(...message: Message<T>[]) {
    this.queue.push(...message);
  }

  abstract run(): Promise<void>;
}

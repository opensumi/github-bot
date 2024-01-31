export abstract class BaseWorker<T> {
  queue: Message<T>[] = [];

  push(...message: Message<T>[]) {
    this.queue.push(...message);
  }

  abstract run(): Promise<void>;
}

export class InMemoryQueue<T> implements Queue<T> {
  async send(
    message: T,
    options?: QueueSendOptions | undefined,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async sendBatch(messages: Iterable<MessageSendRequest<T>>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class InMemoryQueue<T> implements Queue<T> {
  async send(
    _message: T,
    _options?: QueueSendOptions | undefined,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async sendBatch(_messages: Iterable<MessageSendRequest<T>>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

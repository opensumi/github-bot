let mockMessageId = 0;

export class MockMessage<T> implements Message<T> {
  id = String(mockMessageId++);
  timestamp = new Date();
  constructor(public body: T) {}

  retry(): void {
    // throw new Error('Method not implemented.');
  }
  ack(): void {
    // throw new Error('Method not implemented.');
  }
}

export class MockMessageBatch<T> implements MessageBatch<T> {
  queue = 'mock';

  constructor(public messages: MockMessage<T>[]) {}
  retryAll(): void {
    this.messages.forEach((v) => v.retry());
  }
  ackAll(): void {
    this.messages.forEach((v) => v.ack());
  }

  static from<T>(messages: T[]) {
    return new MockMessageBatch(messages.map((v) => new MockMessage(v)));
  }
}

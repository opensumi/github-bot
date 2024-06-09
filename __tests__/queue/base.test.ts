import { QueueConsumer } from '@/queue';
import { BaseWorker } from '@/queue/worker';

import { MockMessage, MockMessageBatch } from '../__mocks__/queue/message';

class Worker<T> extends BaseWorker<T> {
  async run() {
    console.log('run');
  }
}

describe('queue consumer', () => {
  it('can work', async () => {
    const consumer = new QueueConsumer<FakeMessage>();
    const batch = createMessageBatch();
    const wk = new Worker<FakeMessage>();
    consumer.addWorker('test', wk);
    consumer.push(...batch.messages);
    expect(wk.queue.length).toBe(100);
    await consumer.runAndWait();
  });
});

interface FakeMessage {
  type: string;
  data: {
    id: string;
    name: string;
    payload: any;
  };
}

function createMessageBatch() {
  const msgs = new Array(100).fill(0).map((_, i) => ({
    type: 'test',
    data: {
      id: `${i}`,
      name: 'test',
      payload: {},
    },
  }));

  return new MockMessageBatch<FakeMessage>(msgs.map((v) => new MockMessage(v)));
}

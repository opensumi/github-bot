import { makeEdgeEnv, EdgeKVNamespace } from 'edge-mock';
makeEdgeEnv();

declare const FetchEvent: any;
declare const Request: any;

import { QueueConsumer } from '@/queue';
import { BaseWorker } from '@/queue/worker';

import { MockMessage, MockMessageBatch } from '../__mocks__/queue/message';

class Worker<T> extends BaseWorker<T> {
  async run() {
    console.log('run');
  }
}

const env = {
  KV: new EdgeKVNamespace() as any,
  MESSAGE_QUEUE: {} as any,
};
const request = new Request('/?foo=1', { method: 'POST', body: 'hello' });
const event = new FetchEvent('fetch', { request });

describe('queue consumer', () => {
  it('can work', async () => {
    const consumer = new QueueConsumer<FakeMessage>(env, event);
    const batch = createMessageBatch();
    const wk = new Worker<FakeMessage>(env, event);
    consumer.addWorker('test', wk);
    consumer.consume(...batch.messages);
    expect(wk.queue.length).toBe(100);
    await consumer.runAndWait();
  });
});

interface FakeMessage {
  id: number;
  name: string;
  payload: any;
}

function createMessageBatch() {
  const msgs = new Array(100).fill(0).map((_, i) => ({
    id: i,
    name: 'test',
    payload: {},
  }));

  return new MockMessageBatch<FakeMessage>(msgs.map((v) => new MockMessage(v)));
}

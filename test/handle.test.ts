import { makeEdgeEnv, EdgeKVNamespace } from 'edge-mock';
makeEdgeEnv();

import app from '@/index';

declare const FetchEvent: any;
declare const Request: any;

describe('handle', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('handle Missing route', async () => {
    const request = new Request('/?foo=1', { method: 'POST', body: 'hello' });
    const event = new FetchEvent('fetch', { request });
    const result = await app.fetch(
      request,
      {
        KV_PROD: new EdgeKVNamespace() as any,
        HOST: 'https://localhost',
      },
      event,
    );
    expect(result.status).toEqual(404);
  });
});

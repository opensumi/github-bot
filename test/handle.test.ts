import { handleRequest } from '../src/handler';
import { makeEdgeEnv } from 'edge-mock';

declare const FetchEvent: any;
declare const Request: any;

describe('handle', () => {
  beforeEach(() => {
    makeEdgeEnv();
    jest.resetModules();
  });

  test('handle Missing route', async () => {
    const request = new Request('/?foo=1', { method: 'POST', body: 'hello' });
    const event = new FetchEvent('fetch', { request });
    const result = await handleRequest(event);
    expect(result.status).toEqual(301);
  });
});

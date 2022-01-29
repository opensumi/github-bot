import { handleRequest } from '../src/handler';
import { mockFetchEvent } from './utils';
import makeServiceWorkerEnv from 'service-worker-mock';

declare const global: any;

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  test('handle Missing route', async () => {
    const event = mockFetchEvent(new Request('/', { method: 'GET' }));
    const result = await handleRequest(event);
    expect(result.status).toEqual(301);
  });
});

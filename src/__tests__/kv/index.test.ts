import { KVManager } from '@/dal';

import { getTestEnvironment, runInTestEnv } from '../__mocks__/env';

describe('KV', () => {
  describe('KVManager', () => {
    it('should create a KVManager', async () => {
      await runInTestEnv(async () => {
        const manager = KVManager.for<any>('test', 0);
        await manager.set('key1', 'value');
        await manager.setJSON('key', {
          key: 'value',
        });

        const value = await manager.get('key1');
        expect(value).toBe('value');

        const json = await manager.getJSON('key');
        expect(json).toEqual({ key: 'value' });
      });
    });
    it.skip('can cache', async () => {
      jest.useFakeTimers();

      await runInTestEnv(async () => {
        const manager = KVManager.for<any>('test', 500);

        const spy = jest.spyOn(manager.kv, 'get');

        await manager.setJSON('key', {
          key: 'value',
        });

        const a = await manager.getJSONCached('key');
        expect(a).toEqual({ key: 'value' });

        const b = await manager.getJSONCached('key');
        expect(b).toEqual({ key: 'value' });

        // should only call once, the second time should get from cache
        expect(spy).toBeCalledTimes(1);

        jest.advanceTimersByTime(300);

        const c = await manager.getJSONCached('key');
        expect(c).toEqual({ key: 'value' });
        expect(spy).toBeCalledTimes(1);

        jest.advanceTimersByTime(4000);

        const d = await manager.getJSONCached('key');
        expect(d).toEqual({ key: 'value' });

        expect(spy).toBeCalledTimes(2);
        jest.useRealTimers();
      });
    });
  });
});

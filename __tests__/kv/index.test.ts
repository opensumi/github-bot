import { sleep } from '@opensumi/ide-utils/lib/async';

import { KVManager } from '@/kv';

import '../__mocks__/env';

describe('KV', () => {
  describe('KVManager', () => {
    it('should create a KVManager', async () => {
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
    it('can cache', async () => {
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
      await sleep(4000);

      const c = await manager.getJSONCached('key');
      expect(c).toEqual({ key: 'value' });

      expect(spy).toBeCalledTimes(2);
    }, 10000);
  });
});

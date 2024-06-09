import { Deferred } from '@opensumi/ide-utils';

import { CommandCenter } from '../src/center';

describe('bot-commander', () => {
  describe('CommandCenter', () => {
    it('should work', async () => {
      const center = new CommandCenter();

      const deferred = new Deferred<{ raw: string }>();
      center.on('test', async (ctx, command) => {
        deferred.resolve(command);
      });

      await center.tryHandle('/test', { hello: '123' });

      const result = await deferred.promise;

      expect(result.raw).toBe('/test');
    });
  });
});

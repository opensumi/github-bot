import { Deferred } from '@opensumi/ide-utils';

import { CommandCenter } from '../src/center';

describe('bot-commander', () => {
  describe('CommandCenter', () => {
    it('should work', async () => {
      const center = new CommandCenter();

      const deferred = new Deferred<{ text: string }>();
      center.on('test', async ({ text }) => {
        deferred.resolve({ text });
      });

      await center.tryHandle('/test', { hello: '123' });

      const result = await deferred.promise;

      expect(result.text).toBe('/test');
    });
  });
});

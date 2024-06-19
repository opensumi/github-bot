import { Deferred } from '@opensumi/ide-utils';

import { CommandCenter } from '../src/center';
import { ICommand } from '../src/types';
import { removeCommandPrefix } from '../src/utils';

describe('bot-commander', () => {
  describe('CommandCenter', () => {
    it('should work', async () => {
      const center = new CommandCenter();

      const deferred = new Deferred<ICommand<any>>();
      center.on('test', async (ctx, command) => {
        deferred.resolve(command);
        const text = removeCommandPrefix(command.command, 'test');
        console.log(`🚀 ~ center.on ~ text:`, text);
      });

      await center.tryHandle('/test 12345', { hello: '123' });

      const result = await deferred.promise;

      expect(result.raw).toBe('/test 12345');
      expect(result.command).toBe('test');
    });
    it('intercept', async () => {
      const center = new CommandCenter();
      const deferred = new Deferred<ICommand<any>>();
      center.intercept(
        () => {
          center.on('test', async (ctx, command) => {
            deferred.resolve(command);
          });
        },
        async (ctx, command) => {
          command.command = 'hacked';
          return false;
        },
      );

      let triggered = false;
      let intercepted = false;
      center.intercept(
        () => {
          center.on('test2', async (ctx, command) => {
            triggered = true;
          });
        },
        (ctx, command) => {
          intercepted = true;
          return true;
        },
      );

      await center.tryHandle('/test2 12345', { hello: '123' });
      expect(triggered).toBe(false);
      expect(intercepted).toBe(true);
    });
  });
});

import { sleep } from '@opensumi/ide-utils';

import Environment from '@/env';
import { ISSUE_REGEX } from '@/im/commands/constants';
import { runtimeConfig } from '@/runtime/node/config';
import { CommandCenter } from '@opensumi/bot-commander';

import { testEnv } from '../__mocks__/env';

describe('command center', () => {
  afterEach(() => {
    Environment.dispose();
  });
  it('can resolve text', async () => {
    const fn = jest.fn();
    const cc = new CommandCenter({
      prefix: [''],
    });
    cc.on('hello', fn);

    const result = await cc.resolve('hello');
    expect(result).toBeDefined();
    result?.handler({}, cc.parseCommand('hello') as any);
    expect(fn).toBeCalled();
    const notExists = await cc.resolve('something');
    expect(notExists).not.toBeUndefined();
  });
  it('can resolve regex', async () => {
    const fn = jest.fn();
    const cc = new CommandCenter({
      prefix: [''],
    });
    cc.on(ISSUE_REGEX, fn);
    const result = await cc.resolve('#84');
    expect(result).toBeDefined();
    result?.handler({}, cc.parseCommand('hello') as any);
    expect(fn).toBeCalled();
    const notExists = await cc.resolve('something');
    expect(notExists).not.toBeUndefined();
  });

  it('tryHandle would work', async () => {
    const fn = jest.fn();

    const cc = new CommandCenter<{
      name: string;
    }>({
      prefix: ['/'],
    });

    cc.on('hello', async (ctx, command) => {
      console.log(`🚀 ~ file: commander.test.ts:53 ~ cc.on ~ ctx:`, ctx);
      const { name } = ctx;
      expect(name).toBe('opensumi');
      expect(command.raw).toBe('/hello');
      expect(command.command).toBe('hello');
      expect(ctx.token).toBeDefined();
      fn();
    });
    await cc.tryHandle('/hello', {
      name: 'opensumi',
    });
    expect(fn).toBeCalled();

    Environment.dispose();
  });
  it('try handle would canceled if timeout', async () => {
    const fn = jest.fn();
    const tokenOnCancellationRequested = jest.fn();

    Environment.initialize(runtimeConfig, {
      ...testEnv,
      TIMEOUT: String(3 * 1000),
    });

    const cc = new CommandCenter<{
      name: string;
    }>({
      prefix: ['/'],
    });

    cc.on('hello', async (ctx) => {
      console.log(`🚀 ~ file: commander.test.ts:53 ~ cc.on ~ ctx:`, ctx);
      await Promise.race([
        (async () => {
          await sleep(5 * 1000);
          fn();
        })(),
        new Promise<void>((resolve) => {
          ctx.token.onCancellationRequested(() => {
            tokenOnCancellationRequested();
            resolve();
          });
        }),
      ]);
    });
    try {
      await cc.tryHandle(
        '/hello',
        {
          name: 'opensumi',
        },
        {
          timeout: 3 * 1000,
        },
      );
    } catch (error) {
      expect((error as any).message).toBe('Canceled');
    }

    expect(fn).not.toBeCalled();
    expect(tokenOnCancellationRequested).toBeCalled();
  });
});

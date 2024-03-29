import Environment from '@/env';
import { ISSUE_REGEX } from '@/im/commands/constants';
import { LocalKV } from '@/runtime/node/kv';
import { NodeQueue } from '@/runtime/node/queue';
import { CommandCenter } from '@opensumi/bot-commander';

const testEnv: IRuntimeEnv = {
  KV: new LocalKV(),
  MESSAGE_QUEUE: new NodeQueue(),
  ENVIRONMENT: 'unittest',
};

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
    result?.handler();
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
    result?.handler();
    expect(fn).toBeCalled();
    const notExists = await cc.resolve('something');
    expect(notExists).not.toBeUndefined();
  });

  it('tryHandle would work', async () => {
    const fn = jest.fn();

    Environment.from('node', testEnv);

    const cc = new CommandCenter<{
      name: string;
    }>({
      prefix: ['/'],
    });

    cc.on('hello', async (ctx) => {
      console.log(`🚀 ~ file: commander.test.ts:53 ~ cc.on ~ ctx:`, ctx);
      const { name } = ctx;
      expect(name).toBe('opensumi');
      expect(ctx.text).toBe('/hello');
      expect(ctx.result.type).toBe('text');
      expect(ctx.result.command).toBe('hello');
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
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const fn = jest.fn();
    const tokenOnCancellationRequested = jest.fn();

    Environment.from('node', {
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

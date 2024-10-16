import Environment from '@/env';
import { runtimeConfig } from '@/runtime/node/config';
import { LocalKV } from '@/runtime/node/kv';
import { InMemoryQueue } from '@/runtime/node/queue';

const testEnv: IRuntimeEnv = {
  KV: new LocalKV(),
  MESSAGE_QUEUE: new InMemoryQueue(),
  ENVIRONMENT: 'unittest',
};

export const getTestEnvironment = (env: Partial<IRuntimeEnv> = {}) =>
  Environment.from(runtimeConfig, {
    ...testEnv,
    ...env,
  });

export const runInTestEnv = async (
  fn: () => Promise<void>,
  env: Partial<IRuntimeEnv> = {},
) => {
  const e = getTestEnvironment(env);
  return await e.run(fn);
};

import Environment from '@/env';
import { runtimeConfig } from '@/runtime/node/config';
import { LocalKV } from '@/runtime/node/kv';
import { InMemoryQueue } from '@/runtime/node/queue';

export const testEnv: IRuntimeEnv = {
  KV: new LocalKV(),
  MESSAGE_QUEUE: new InMemoryQueue(),
  ENVIRONMENT: 'unittest',
};

Environment.initialize(runtimeConfig, testEnv);

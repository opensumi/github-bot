import Environment from '@/env';
import { runtimeConfig } from '@/runtime/node/config';
import { InMemoryKV } from '@/runtime/node/kv';
import { InMemoryQueue } from '@/runtime/node/queue';

export const testEnv: IRuntimeEnv = {
  KV: new InMemoryKV(),
  MESSAGE_QUEUE: new InMemoryQueue(),
  ENVIRONMENT: 'unittest',
};

Environment.initialize(runtimeConfig, testEnv);

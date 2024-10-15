import 'dotenv/config';

import Environment from '@/env';

import { runtimeConfig } from './config';
import { InMemoryKV, NodeKV } from './kv';
import { InMemoryQueue } from './queue';

const kv = process.env.IN_MEMORY_KV ? new InMemoryKV() : new NodeKV();

Environment.initialize(runtimeConfig, {
  ...process.env,
  KV: kv,
  MESSAGE_QUEUE: new InMemoryQueue(),
  ENVIRONMENT: 'local',
});

import './base';

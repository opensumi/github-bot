import 'dotenv/config';

import Environment from '@/env';

import { runtimeConfig } from './config';
import { NodeKV } from './kv';
import { InMemoryQueue } from './queue';

Environment.initialize(runtimeConfig, {
  ...process.env,
  KV: new NodeKV(),
  MESSAGE_QUEUE: new InMemoryQueue(),
  ENVIRONMENT: 'local',
});

import './base';

import 'dotenv/config';

import Environment from '@/env';

import { runtimeConfig } from './config';
import { NodeKV } from './kv';
import { NodeAnalyticsEngineDataset } from './metrics';
import { InMemoryQueue } from './queue';

Environment.initialize(runtimeConfig, {
  ...process.env,
  KV: new NodeKV(),
  MESSAGE_QUEUE: new InMemoryQueue(),
  metricsDataset: new NodeAnalyticsEngineDataset(),
  ENVIRONMENT: 'local',
});

import './base';

import 'dotenv/config';

import Environment from '@/env';

import { runtimeConfig } from './config';
import { NodeKV } from './kv';
import { NodeAnalyticsEngineDataset } from './metrics';
import { NodeQueue } from './queue';

Environment.initialize(runtimeConfig, {
  ...process.env,
  KV: new NodeKV(),
  MESSAGE_QUEUE: new NodeQueue(),
  metricsDataset: new NodeAnalyticsEngineDataset(),
  ENVIRONMENT: 'local',
});

import './base';

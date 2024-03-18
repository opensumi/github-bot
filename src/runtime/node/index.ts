import 'dotenv/config';

import Environment from '@/env';

import { NodeKV } from './kv';
import { NodeAnalyticsEngineDataset } from './metrics';
import { NodeQueue } from './queue';

Environment.from('node', {
  ...process.env,
  KV: new NodeKV(),
  MESSAGE_QUEUE: new NodeQueue(),
  metricsDataset: new NodeAnalyticsEngineDataset(),
  ENVIRONMENT: 'local',
});

import './base';

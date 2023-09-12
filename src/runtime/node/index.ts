import 'dotenv/config';

import Environment from '@/env';

import { NodeKV } from './kv';
import { NodeAnalyticsEngineDataset } from './metrics';

Environment.from('node', {
  ...process.env,
  KV_PROD: new NodeKV(),
  metricsDataset: new NodeAnalyticsEngineDataset(),
});

import './base';

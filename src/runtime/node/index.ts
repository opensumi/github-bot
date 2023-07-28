import 'dotenv/config';

import Environment from '@/env';

import { NodeKV } from './kv';

Environment.from('node', {
  ...process.env,
  KV_PROD: new NodeKV(),
});

import './base';

import 'dotenv/config';

import { serve } from '@hono/node-server';
import { EdgeKVNamespace } from 'edge-mock';
import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';

const app = new Hono() as THono;
ignition(app);

// @ts-expect-error Node
Environment.from({
  ...process.env,
  KV_PROD: new EdgeKVNamespace(),
});

serve(app);

/* eslint-disable @typescript-eslint/no-namespace */
import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';

import { NodeKV } from './kv';

const port = process.env.PORT ? Number(process.env.PORT) : 8787;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly OPENAI_API_KEY?: string;
    }
  }
}

Environment.from('node', {
  ...process.env,
  KV_PROD: new NodeKV(),
});

const app = new Hono() as THono;
ignition(app);

serve({
  fetch(request) {
    return app.fetch(
      request,
      {},
      {
        waitUntil(promise) {
          promise;
        },
        passThroughOnException() {
          //
        },
      },
    );
  },
  port: port,
});

console.log(`listened on http://localhost:${port}`);

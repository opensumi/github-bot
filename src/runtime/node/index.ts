/* eslint-disable @typescript-eslint/no-namespace */
import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { ignition } from '@/api';
import Environment from '@/env';

import { NodeKV } from './kv';

const port = Number(process.env.PORT) || 8787;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly HOST: string;
      readonly OPENAI_API_KEY?: string;
      readonly OPENAI_ACCESS_TOKEN?: string;
      readonly CHATGPT_API_REVERSE_PROXY_URL?: string;
    }
  }
}

const app = new Hono() as THono;
ignition(app);

serve({
  fetch(request) {
    Environment.from({
      ...process.env,
      KV_PROD: new NodeKV(),
    });
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

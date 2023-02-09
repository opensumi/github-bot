import { Hono } from 'hono';
import { Toucan } from 'toucan-js';

import { ISend } from './api/middleware/send.ts';

declare module 'hono' {
  interface Context {
    sentry?: Toucan;
    send: ISend;
  }
}

declare module '@louwers/marked' {}

declare global {
  interface Env {
    readonly KV_PROD: KVNamespace;
    readonly HOST: string;
    readonly SENTRY_DSN?: string;
    readonly OPENAI_API_KEY?: string;
    // readonly MY_QUEUE: Queue;
  }

  type THonoEnvironment = { Bindings: Env };
  type THono = Hono<THonoEnvironment>;
}

export {};

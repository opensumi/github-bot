import { Hono } from 'hono';

import { ISend } from './api/middleware/send.ts';

declare module 'hono' {
  interface Context {
    send: ISend;
  }
}

declare global {
  interface IRuntimeEnv {
    readonly KV_PROD: KVNamespace;
    readonly HOST: string;
    readonly OPENAI_API_KEY?: string;
    // readonly MY_QUEUE: Queue;
  }

  type THonoEnvironment = { Bindings: IRuntimeEnv };
  type THono = Hono<THonoEnvironment>;
}

export {};

import { Hono } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { Toucan } from 'toucan-js';

declare module 'hono' {
  interface Context {
    sentry?: Toucan;
    waitUntil: (promise: Promise<any>) => void;
    send: {
      error(status: StatusCode | number, content: string): Response;
      validateError(status: StatusCode | number, data: any): Response;
      message(text: string): Response;
    };
  }
}

declare global {
  interface Env {
    readonly KV_PROD: KVNamespace;
    readonly HOST: string;
    readonly SENTRY_DSN?: string;
    readonly OPENAI_API_KEY?: string;
    // readonly MY_QUEUE: Queue;
  }

  type THono = Hono<{ Bindings: Env }>;
}

export {};

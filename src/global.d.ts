import { Hono } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import Toucan from 'toucan-js';

declare module 'hono' {
  interface Context {
    sentry?: Toucan;
    waitUntil: (promise: Promise<any>) => void;
    send: {
      error(status: StatusCode, content: string): Response;
      message(text: string): Response;
    };
  }
}

declare global {
  interface Env {
    KV_PROD: KVNamespace;
    HOST: string;
    SENTRY_DSN?: string;
  }

  type THono = Hono<{ Bindings: Env }>;
}

export {};

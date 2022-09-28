import { Hono } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import Toucan from 'toucan-js';

declare module 'hono' {
  interface Context {
    sentry?: Toucan;
    waitUntil: (promise: Promise<any>) => void;
    error(status: StatusCode, content: string): Response;
    message(text: string): Response;
  }
}
export interface Env {
  KV_PROD: KVNamespace;
  HOST: string;
  SENTRY_DSN?: string;
}

export type THono = Hono<{ Bindings: Env }>;

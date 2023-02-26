import { Hono } from 'hono';
import type { CookieJar } from 'tough-cookie';

import { ISend } from './api/middleware/send.ts';

declare module 'hono' {
  interface Context {
    send: ISend;
  }
}

interface KVNamespace {
  get(key: string, options?: { cacheTtl?: number }): KVValue<string>;
  get(key: string, type: 'text'): KVValue<string>;
  get<ExpectedValue = unknown>(
    key: string,
    type: 'json',
  ): KVValue<ExpectedValue>;

  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer | FormData,
    options?: {
      expiration?: string | number;
      expirationTtl?: string | number;
      metadata?: any;
    },
  ): Promise<void>;

  delete(key: string): Promise<void>;

  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    keys: { name: string; expiration?: number; metadata?: unknown }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

declare global {
  interface IRuntimeEnv {
    readonly KV_PROD: KVNamespace;
    readonly HOST: string;
    readonly OPENAI_API_KEY?: string;
    readonly OPENAI_ACCESS_TOKEN?: string;
    readonly CHATGPT_API_REVERSE_PROXY_URL?: string;
    // readonly MY_QUEUE: Queue;
    [key: string]: unknown;
  }

  type THonoEnvironment = { Bindings: IRuntimeEnv };
  type THono = Hono<THonoEnvironment>;
}

export {};

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
}

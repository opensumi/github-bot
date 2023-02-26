import { Hono } from 'hono';
import type { CookieJar } from 'tough-cookie';

import { ISend } from './api/middleware/send.ts';

declare module 'hono' {
  interface Context {
    send: ISend;
  }
}

declare global {
  type TKVValue<Value> = Promise<Value | null>;
  interface IKVNamespace {
    get(key: string, type: 'text'): TKVValue<string>;
    get<ExpectedValue = unknown>(
      key: string,
      type: 'json',
    ): TKVValue<ExpectedValue>;

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
  }

  interface IRuntimeEnv {
    readonly KV_PROD: IKVNamespace;
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

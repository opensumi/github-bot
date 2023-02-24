import { Hono } from 'hono';
import type { CookieJar } from 'tough-cookie';

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
    readonly OPENAI_ACCESS_TOKEN?: string;
    readonly CHATGPT_API_REVERSE_PROXY_URL?: string;
    readonly CHATGPT_ENDPOINT?: string;
    // readonly MY_QUEUE: Queue;
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

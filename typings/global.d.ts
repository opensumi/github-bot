import { Hono } from 'hono';

export {};

declare module 'hono' {
  interface Context {
    send: ISend;
    origin: string;
  }
}

declare global {
  interface ISend {
    error(status: number, content: string): Response;
    message(text: string): Response;
  }

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
    readonly OPENAI_API_KEY?: string;
    readonly TIMEOUT?: string;
    [key: string]: unknown;
  }

  type THonoEnvironment = { Bindings: IRuntimeEnv };
  type THono = Hono<THonoEnvironment>;

  declare module '*.svg' {
    const content: string;
    export default content;
  }

  declare module '*.html' {
    const content: string;
    export default content;
  }
}

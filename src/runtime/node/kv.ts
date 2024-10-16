import { WorkersKV } from '@opensumi/workers-kv';
import { workersKvDebug } from '@opensumi/workers-kv/lib/utils';
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const cfAuthToken = process.env.CLOUDFLARE_AUTH_TOKEN!;
const cfNamespaceId = process.env.CLOUDFLARE_NAMESPACE_ID!;

export class NodeKV implements IKVNamespace {
  kv: WorkersKV;
  constructor() {
    this.kv = new WorkersKV(cfAccountId, cfAuthToken, cfNamespaceId);
  }
  async get(key: string, type: 'text'): TKVValue<string>;
  async get<ExpectedValue = unknown>(
    key: string,
    type: 'json',
  ): TKVValue<ExpectedValue>;
  async get<ExpectedValue = unknown>(
    key: string,
    type?: unknown,
  ): Promise<string | Awaited<ExpectedValue> | null> {
    const response = await this.kv.get(key);
    if (!response.ok) {
      workersKvDebug('get', key, response.status, response.statusText);
      return null;
    }
    if (type === 'json') {
      return await response.json();
    }
    return await response.text();
  }
  async put(
    key: string,
    value: string | ArrayBuffer | FormData | ReadableStream<any>,
  ): Promise<void> {
    await this.kv.put(key, value);
  }
  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

export class LocalKV implements IKVNamespace {
  private _db: Low<any> | undefined;

  private async db() {
    if (!this._db) {
      this._db = await JSONFilePreset('db.json', {});
    }
    return this._db;
  }

  async get(key: unknown, type?: unknown): TKVValue<any> {
    let result = (await this.db()).data[key as any];
    if (!result) {
      return Promise.resolve(result);
    }

    if (type === 'json') {
      result = JSON.parse(result);
    }

    return Promise.resolve(result);
  }
  async put(
    key: string,
    value: string | ArrayBuffer | FormData | ReadableStream<any>,
    _options?:
      | {
          expiration?: string | number | undefined;
          expirationTtl?: string | number | undefined;
          metadata?: any;
        }
      | undefined,
  ): Promise<void> {
    (await this.db()).data[key] = value;
    await (await this.db()).write();
  }
  async delete(key: string): Promise<void> {
    (await this.db()).data[key] = undefined;
    await (await this.db()).write();
  }
}

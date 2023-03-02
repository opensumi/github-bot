import { WorkersKV } from '@/runtime/node/workers-kv';

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const cfAuthToken = process.env.CLOUDFLARE_AUTH_TOKEN!;
const cfNamespaceId = process.env.CLOUDFLARE_NAMESPACE_ID!;

export class NodeKV implements IKVNamespace {
  kv: WorkersKV;
  constructor() {
    this.kv = new WorkersKV({
      cfAccountId,
      cfAuthToken,
      namespaceId: cfNamespaceId,
    });
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
    const result = await this.kv.readKey({
      key,
    });
    if (!result.success) {
      return null;
    }

    if (type === 'json') {
      if (result.type === 'json') {
        return result.data;
      }
      return JSON.parse(result.data);
    }
    return result.data;
  }
  async put(
    key: string,
    value: string | ArrayBuffer | FormData | ReadableStream<any>,
  ): Promise<void> {
    await this.kv.writeKey({
      key,
      value,
    });
  }
  async delete(key: string): Promise<void> {
    await this.kv.deleteKey({ key });
  }
}

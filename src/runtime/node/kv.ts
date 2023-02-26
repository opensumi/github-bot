import KeyV from 'keyv';

export class NodeKV implements IKVNamespace {
  kv: KeyV<any, Record<string, unknown>>;
  constructor() {
    this.kv = new KeyV();
  }
  get(key: string, type: 'text'): TKVValue<string>;
  get<ExpectedValue = unknown>(
    key: string,
    type: 'json',
  ): TKVValue<ExpectedValue>;
  get<ExpectedValue = unknown>(
    key: unknown,
    type?: unknown,
  ): TKVValue<string> | TKVValue<ExpectedValue> {
    return this.kv.get(key as any, { raw: false });
  }
  async put(
    key: string,
    value: string | ArrayBuffer | FormData | ReadableStream<any>,
  ): Promise<void> {
    await this.kv.set(key, value);
  }
  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

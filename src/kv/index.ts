import Environment from '@/env';

export * from './constants';

export class KVManager<T> {
  kv: IKVNamespace;

  private prefix: string;
  private constructor(prefix = '') {
    this.prefix = prefix;
    this.kv = Environment.instance().KV;
  }

  f(key: string) {
    return this.prefix + key;
  }

  async get(key: string) {
    return await this.kv.get(this.f(key), 'text');
  }

  async set(key: string, data: T) {
    return await this.kv.put(this.f(key), String(data));
  }

  async getJSON(key: string) {
    return await this.kv.get<T>(this.f(key), 'json');
  }

  async setJSON(key: string, data: T) {
    return await this.kv.put(this.f(key), JSON.stringify(data));
  }

  async updateJSON(key: string, data: Partial<T>) {
    const oldData = (await this.getJSON(key)) ?? {};
    const newData = Object.assign({}, oldData, data);
    return await this.kv.put(this.f(key), JSON.stringify(newData));
  }
  async delete(key: string) {
    return await this.kv.delete(this.f(key));
  }

  static #cache: Map<string, KVManager<any>> = new Map();

  static for<T>(prefix: string): KVManager<T> {
    if (!this.#cache.has(prefix)) {
      this.#cache.set(prefix, new KVManager(prefix));
    }
    return this.#cache.get(prefix)!;
  }
}

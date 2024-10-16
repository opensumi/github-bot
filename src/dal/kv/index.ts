import Environment, { getEnvironment } from '@/env';
import { merge } from 'es-toolkit';

export type MemoizeFn<T> = (key: string) => Promise<T | null>;

export const memoize = <T>(fn: MemoizeFn<T>, timeout: number) => {
  let cache: T | null = null;
  let lastUpdate = 0;

  return async (key: string) => {
    const now = Date.now();
    if (now - lastUpdate > timeout || !cache) {
      cache = await fn(key);
      lastUpdate = now;
    }

    return cache;
  };
};

export class KVManager<T> {
  kv: IKVNamespace;

  private id: string;
  private constructor(
    id = '',
    protected ttl = 0,
  ) {
    this.id = id;
    this.kv = getEnvironment().KV;
    this.getJSONCached = this.momoizeGetJSON(this.ttl);
  }

  f(key: string) {
    return this.id + key;
  }

  async get(key: string) {
    return await this.kv.get(this.f(key), 'text');
  }

  async set(key: string, data: T) {
    return await this.kv.put(this.f(key), String(data));
  }

  getJSONCached: MemoizeFn<T | null>;
  async getJSON(key: string) {
    return await this.kv.get<T>(this.f(key), 'json');
  }

  momoizeGetJSON(timeout: number) {
    return memoize(this.getJSON.bind(this), timeout);
  }

  async setJSON(key: string, data: T) {
    return await this.kv.put(this.f(key), JSON.stringify(data));
  }

  async updateJSON(key: string, data: Partial<T>) {
    const oldData = (await this.getJSON(key)) ?? ({} as Partial<T>);
    const newData = merge(oldData, data);
    return await this.kv.put(this.f(key), JSON.stringify(newData));
  }

  async delete(key: string) {
    return await this.kv.delete(this.f(key));
  }

  static #cache: Map<string, KVManager<any>> = new Map();

  static for<T>(key: string, ttl = 0): KVManager<T> {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, new KVManager(key, ttl));
    }
    return this.#cache.get(key)!;
  }
}

export class KVItem<T> {
  static #cache: Map<string, KVItem<any>> = new Map();
  manager: KVManager<T>;
  private constructor(public key: string) {
    this.manager = KVManager.for<T>('');
  }

  static for<T>(key: string): KVItem<T> {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, new KVItem(key));
    }
    return this.#cache.get(key)!;
  }

  get() {
    return this.manager.getJSON(this.key);
  }

  set(data: T) {
    return this.manager.setJSON(this.key, data);
  }

  update(data: Partial<T>) {
    return this.manager.updateJSON(this.key, data);
  }
}

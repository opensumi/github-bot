import { CompareFunc } from './types';

interface RegistryItem<K, T> {
  data: K;
  handler: T;
}

abstract class BaseRegistry {}

export class RegexRegistry extends BaseRegistry {}

export class Registry<K, T> extends BaseRegistry {
  private _array = new Map<K, [T, CompareFunc<K>]>();

  get handlers() {
    return Array.from(this._array.entries());
  }

  add(m: K, handler: T, rule: CompareFunc<K>) {
    this._array.set(m, [handler, rule]);
  }

  find(query: string) {
    for (const [m, h] of this._array) {
      const [handler, compareFunc] = h;
      if (compareFunc(m, query)) {
        return { data: m, handler } as RegistryItem<K, T>;
      }
    }
  }

  findAll(query: string) {
    const handlers = [] as RegistryItem<K, T>[];
    for (const [m, h] of this._array) {
      const [handler, compareFunc] = h;
      if (compareFunc(m, query)) {
        handlers.push({ data: m, handler });
      }
    }
    return handlers;
  }
}

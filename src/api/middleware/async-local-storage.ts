import { AsyncLocalStorage } from 'node:async_hooks';

import { Context, Env } from 'hono';
import { createMiddleware } from 'hono/factory';

type Callback<T, E extends Env> = (c: Context<E>) => T;

export const asyncLocalStorage = <T>() => {
  const localStorage = new AsyncLocalStorage<T>();
  return {
    middleware: <E extends Env = Env>(callback: Callback<T, E>) =>
      createMiddleware(async (c, next) => {
        const obj = callback(c);
        return localStorage.run(obj, next);
      }),
    get: (key: keyof T) => {
      const store = localStorage.getStore() as T;
      if (!store) {
        throw new Error('no async store found');
      }
      return store[key];
    },
  };
};

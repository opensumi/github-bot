import { Context } from 'hono';

import { asyncLocalStorage } from './middleware/async-local-storage';

export type ContinuationContext = {
  ctx: Context<THonoEnvironment>;
};

const { store, get } = asyncLocalStorage<ContinuationContext>();

export { store };

export const context = () => get('ctx');

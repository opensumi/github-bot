import { Context } from 'hono';

import { asyncLocalStorage } from './middleware/async-local-storage';

export type ContinuationContext = {
  ctx: Context<THonoEnvironment>;
};

const { middleware, get } = asyncLocalStorage<ContinuationContext>();

export { middleware };

export const context = () => get('ctx');

import * as GitHub from './github';

export function applyMiddleware(hono: THono) {
  GitHub.middleware(hono);
}

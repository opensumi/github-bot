import * as GitHub from './github';

export function useMiddleware(hono: THono) {
  GitHub.middleware(hono);
}

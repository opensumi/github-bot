import * as GitHub from './github';
import { applySendUtils } from './send';

export function applyMiddleware(hono: THono) {
  applySendUtils(hono);

  GitHub.middleware(hono);
}

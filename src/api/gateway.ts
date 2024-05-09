import { getPath } from 'hono/utils/url';

export enum ERuleName {
  Run = '/run',
}

const rules = {
  'opensumi.run': ERuleName.Run,
  'github.opensumi.run': ERuleName.Run,
} as Record<string, ERuleName>;

export function dispatch(request: Request) {
  const rawPath = getPath(request);
  const hostname = new URL(request.url).hostname;

  const path = rules[hostname];
  if (path) {
    return path + rawPath;
  }
  return rawPath;
}

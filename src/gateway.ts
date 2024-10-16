import { getPath, mergePath } from 'hono/utils/url';

export enum ERuleName {
  Run = '/run/',
}

const rules = {
  'opensumi.run': ERuleName.Run,
  'github.opensumi.run': ERuleName.Run,
  'local.opensumi.run': ERuleName.Run,
} as Record<string, ERuleName>;

function getTarget(request: Request) {
  const rawPath = getPath(request);
  const hostname = new URL(request.url).hostname;

  const path = rules[hostname];
  if (path) {
    return mergePath(path, rawPath);
  }
  return rawPath;
}

/**
 * 将请求根据域名分发到不同的服务
 */
export function dispatch(request: Request) {
  const target = getTarget(request);
  console.log(`[dispatch] ${request.url} -> ${target}`);
  return target;
}

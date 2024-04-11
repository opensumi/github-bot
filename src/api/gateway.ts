import { getPath } from 'hono/utils/url';

export enum SupportedUpstreams {
  Run = '/run',
}

export const domainSpecific = {
  [SupportedUpstreams.Run]: new Set<string>([
    'opensumi.run',
    'github.opensumi.run',
  ]),
};

export function dispatch(request: Request) {
  const rawPath = getPath(request);

  const hostname = new URL(request.url).hostname;
  if (domainSpecific[SupportedUpstreams.Run].has(hostname)) {
    return SupportedUpstreams.Run + rawPath;
  }
  return rawPath;
}

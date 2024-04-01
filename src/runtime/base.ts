import { getPath } from 'hono/utils/url';

export const commonOptions = {
  getPath(request: Request) {
    const rawPath = getPath(request);

    const hostname = new URL(request.url).hostname;
    if (hostname === 'opensumi.run') {
      return '/run' + rawPath;
    }

    return rawPath;
  },
};

import { error } from './utils';

function getURL(_url: string) {
  try {
    return new URL(_url);
  } catch (error) {
    return undefined;
  }
}

export function handler(
  request: Request & { params?: { url?: string }; query?: { url?: string } },
) {
  const { params, query } = request;
  const _url = params?.url ?? query?.url;
  if (_url) {
    const candidates = [_url, decodeURIComponent(_url)]
      .map(getURL)
      .filter(Boolean);

    if (candidates.length > 0 && candidates[0]) {
      const url = candidates[0];
      return fetch(url.toString(), request);
    }
  }

  return error(401, 'not a valid hostname');
}

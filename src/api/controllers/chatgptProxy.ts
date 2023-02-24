import Environment from '@/env';

export async function forwardReq(
  request: Request<unknown, string, any>,
  newHost: string,
  path: string,
) {
  const newHdrs = new Headers();
  for (const [key, value] of request.headers) {
    if (key.toLowerCase().startsWith('cf-')) {
      continue;
    }
    if (key.toLowerCase() == 'x-forwarded-for') {
      continue;
    }
    if (key.toLowerCase() == 'x-real-ip') {
      continue;
    }
    newHdrs.set(key, value);
  }
  newHdrs.set('Host', newHost);
  newHdrs.set('accept', 'text/event-stream');
  newHdrs.set('origin', 'https://chat.openai.com');
  newHdrs.set('referer', 'https://chat.openai.com/chat');
  newHdrs.set(
    'user-agent',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  );

  const url = new URL(request.url);
  url.hostname = newHost;
  url.pathname = path;
  const address = url.toString();

  const init = {
    body: request.body,
    headers: newHdrs,
    method: request.method,
  };

  const response = await fetch(address, init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
  });
}

export function route(hono: THono) {
  hono.all('/chatgpt/*', async (c) => {
    const endpoint = Environment.instance().CHATGPT_ENDPOINT;
    if (!endpoint) {
      return c.send.error(500, 'CHATGPT_ENDPOINT not set');
    }
    const _url = c.req.url;
    const url = new URL(_url);
    const path = url.pathname;
    const proxy = path.replace('/chatgpt', '');
    return forwardReq(
      c.req,
      Environment.instance().CHATGPT_ENDPOINT ?? '',
      proxy,
    );
  });
}

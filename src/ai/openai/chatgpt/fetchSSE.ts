import { createParser } from 'eventsource-parser';

import { streamAsyncIterable } from './stream-async-iterable';
import * as types from './types';

export async function fetchSSE(
  url: string,
  options: Parameters<typeof fetch>[1] & { onMessage: (data: string) => void },
) {
  const { onMessage, ...fetchOptions } = options;
  const res = await fetch(url, {
    ...fetchOptions,
  });
  if (!res.ok) {
    const msg = `ChatGPT error ${res.status || res.statusText}`;
    const error = new types.ChatGPTError(msg, { cause: res });
    error.statusCode = res.status;
    error.statusText = res.statusText;
    throw error;
  }

  const parser = createParser((event) => {
    console.log(`🚀 ~ file: fetchSSE.ts:21 ~ parser ~ event:`, event);
    if (event.type === 'event') {
      onMessage(event.data);
    }
  });
  if (res.body) {
    for await (const chunk of streamAsyncIterable(res.body)) {
      const str = new TextDecoder().decode(chunk);
      parser.feed(str);
    }
  } else {
    onMessage('[BOT:NO_RESPONSE]');
  }
}

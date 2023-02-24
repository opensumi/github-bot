import { createParser } from '@/lib/eventsource-parser';

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
    const data = await res.text();
    const msg = `ChatGPT error ${res.status || res.statusText} ${data}`;
    const error = new types.ChatGPTError(msg, { cause: res });
    error.statusCode = res.status;
    error.statusText = res.statusText;
    throw error;
  }

  const parser = createParser((event) => {
    console.log(`🚀 ~ file: fetchSSE.ts:23 ~ parser ~ event:`, event);
    if (event.type === 'event') {
      onMessage(event.data);
    }
  });
  if (res.body) {
    for await (const chunk of streamAsyncIterable(res.body)) {
      const str = new TextDecoder().decode(chunk);
      const line = str.slice(2, -1);
      if (line === 'Internal Server Error') {
        const error = new types.ChatGPTError(line, { cause: res });
        throw error;
      }

      let mayJson: any;
      try {
        mayJson = JSON.parse(str);
      } catch (error) {}
      if (mayJson) {
        if (mayJson.detail) {
          const error = new types.ChatGPTError(mayJson.detail, { cause: res });
          throw error;
        }
      }

      parser.feed(str);
    }
  } else {
    onMessage('[BOT:NO_RESPONSE]');
  }
}

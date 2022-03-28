import { send } from '@/ding/utils';
import { Setting } from '@/secrets';
import { MarkdownContent } from './types';

function securityInterception(text: string) {
  text = text.replaceAll('dingtalk://dingtalkclient/page/link?url=', '');
  return text;
}

export async function sendContentToDing(
  dingContent: Record<string, unknown>,
  eventName: string,
  setting: Setting,
) {
  if (setting.dingWebhooks.length === 0) {
    return;
  }

  const toPromise = [] as Promise<void>[];

  for (const webhook of setting.dingWebhooks) {
    console.log(`webhook`, webhook);
    if (webhook.event && webhook.event.length > 0) {
      // 如果 webhook 设置了只接受的 event，查询一下
      if (!webhook.event.includes(eventName)) {
        // 如果这个 webhook 不接收本次 event，就跳过
        continue;
      }
    }

    toPromise.push(
      (async () => {
        console.log('send to ', webhook.url);
        await send(dingContent, webhook.url, webhook.secret);
      })(),
    );
  }
  await Promise.all(toPromise);
}

export async function sendToDing(
  data: MarkdownContent,
  eventName: string,
  setting: Setting,
) {
  if (setting.dingWebhooks.length === 0) {
    return;
  }
  const { text: _text, title } = data;

  const text = securityInterception(_text);

  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };

  await sendContentToDing(dingContent, eventName, setting);
}

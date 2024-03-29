import { EmitterWebhookEventName } from '@octokit/webhooks';

import { standardizeMarkdown } from '@/github/renderer/make-mark';
import { ISetting } from '@/kv/types';
import {
  Markdown,
  markdown as _markdown,
} from '@opensumi/dingtalk-bot/lib/types';
import { send } from '@opensumi/dingtalk-bot/lib/utils';

import { MarkdownContent } from './types';

export function markdown(title: string, text: string): Markdown {
  return _markdown(title, standardizeMarkdown(text));
}

function dingSecurityInterception(text: string) {
  text = text.replaceAll('dingtalk://dingtalkclient/page/link?url=', '');
  return text;
}

export async function sendToDing(
  data: MarkdownContent,
  eventName: EmitterWebhookEventName,
  setting: ISetting,
) {
  if (!setting.dingWebhooks || setting.dingWebhooks.length === 0) {
    console.error('no ding webhook setting, please check');
    return;
  }

  const dingContent = markdown(data.title, data.text);
  dingContent.markdown.text = dingSecurityInterception(
    dingContent.markdown.text,
  );

  await sendContentToDing(dingContent, eventName, setting);
}

export async function sendContentToDing(
  dingContent: Record<string, unknown>,
  eventName: EmitterWebhookEventName,
  setting: ISetting,
) {
  if (setting.dingWebhooks.length === 0) {
    return;
  }

  const promises = [] as Promise<void>[];

  for (const webhook of setting.dingWebhooks) {
    console.log(`webhook`, webhook);
    if (webhook.event && webhook.event.length > 0) {
      // 如果 webhook 设置了只接受的 event，查询一下
      if (!webhook.event.includes(eventName)) {
        // 如果这个 webhook 不接收本次 event，就跳过
        continue;
      }
    }

    promises.push(
      (async () => {
        console.log('send to ', webhook.url);
        await send(dingContent, webhook.url, webhook.secret);
      })(),
    );
  }
  await Promise.allSettled(promises);
}

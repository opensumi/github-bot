import { EmitterWebhookEventName } from '@octokit/webhooks';

import { context } from '@/api/context';
import {
  IMakeMarkdownOptions,
  standardizeMarkdown,
} from '@/github/renderer/make-mark';
import { ISetting } from '@/kv/types';
import { limitTextByPosition } from '@/utils';
import {
  Markdown,
  markdown as _markdown,
} from '@opensumi/dingtalk-bot/lib/types';
import { send } from '@opensumi/dingtalk-bot/lib/utils';

import { MarkdownContent } from './types';

/**
 * 钉钉最大 5000 字
 */
export function convertToDingMarkdown(
  title: string,
  text: string,
  options?: IMakeMarkdownOptions,
): Markdown {
  const _text = limitTextByPosition(text, 5000 - title.length - 10);
  return _markdown(title, standardizeMarkdown(_text, options));
}

function dingSecurityInterception(text: string) {
  text = text.replaceAll('dingtalk://dingtalkclient/page/link?url=', '');
  return text;
}

export const createImageProxy = () => {
  return {
    handleImageUrl: (url: string) => {
      try {
        return context().getProxiedUrl(url);
      } catch (error) {
        return url;
      }
    },
  };
};

export async function sendToDing(
  data: MarkdownContent,
  eventName: EmitterWebhookEventName,
  setting: ISetting,
) {
  if (!setting.dingWebhooks || setting.dingWebhooks.length === 0) {
    console.error('no ding webhook setting, please check');
    return;
  }

  const dingContent = convertToDingMarkdown(
    data.title,
    data.text,
    createImageProxy(),
  );

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

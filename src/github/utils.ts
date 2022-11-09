import { EmitterWebhookEventName } from '@octokit/webhooks';

import { markdown } from '@/ding/message';
import { send } from '@/ding/utils';
import { ISetting } from '@/github/storage';

import { MarkdownContent } from './types';

function securityInterception(text: string) {
  text = text.replaceAll('dingtalk://dingtalkclient/page/link?url=', '');
  return text;
}

interface ReplaceOptions {
  owner: string;
  repo: string;
}

export function replaceGitHubUrlToMarkdown(
  text: string,
  options: ReplaceOptions,
) {
  console.log(`🚀 ~ file: utils.ts ~ line 23 ~ options`, options);
  const repoPullToReplace = new RegExp(
    `(https:\\/\\/github\\.com\\/${options.owner}\\/${options.repo}\\/pull\\/(\\d+))`,
    "gm"
  );
  
  const replaced = text.replaceAll(repoPullToReplace, '[#$2]($1)')

  return replaced;
}

export async function sendContentToDing(
  dingContent: Record<string, unknown>,
  eventName: EmitterWebhookEventName,
  setting: ISetting,
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
  eventName: EmitterWebhookEventName,
  setting: ISetting,
) {
  if (setting.dingWebhooks.length === 0) {
    return;
  }
  const { text: _text, title } = data;

  const text = securityInterception(_text);

  const dingContent = markdown(title, text);

  await sendContentToDing(dingContent, eventName, setting);
}

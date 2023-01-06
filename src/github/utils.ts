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
  const pull = new RegExp(
    `(https:\\/\\/github\\.com\\/${options.owner}\\/${options.repo}\\/pull\\/(\\d+))`,
    'gm',
  );

  let replaced = text.replaceAll(pull, '[#$2]($1)');
  // https://github.com/opensumi/core/compare/v2.21.3...v2.21.4
  const compare = new RegExp(
    `(https:\\/\\/github\\.com\\/${options.owner}\\/${options.repo}\\/compare\\/(.*))`,
    'gm',
  );
  replaced = replaced.replaceAll(compare, '[$2]($1)');

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

export function contentToMarkdown(data: MarkdownContent) {
  const { text: _text, title } = data;

  const text = securityInterception(_text);

  const dingContent = markdown(title, text);
  return dingContent;
}

export async function sendToDing(
  data: MarkdownContent,
  eventName: EmitterWebhookEventName,
  setting: ISetting,
) {
  if (setting.dingWebhooks.length === 0) {
    return;
  }
  const dingContent = contentToMarkdown(data);
  await sendContentToDing(dingContent, eventName, setting);
}

export function replaceGitHubText(text: string) {
  let tmp = text;
  let regexResult: RegExpExecArray | null = null;
  do {
    // https://stackoverflow.com/questions/1028362/how-do-i-extract-html-img-sources-with-a-regular-expression
    const imgRegex = /<img\s.*?src=(?:'|\")([^'\">]+)(?:'|\").*?\/?>/gm;
    regexResult = imgRegex.exec(tmp);
    if (regexResult) {
      const newMsg = `![](${regexResult[1]})`;
      tmp = tmp.replaceAll(regexResult[0], newMsg);
    }
  } while (regexResult);

  return tmp;
}

function getUrl(str: string) {
  try {
    const url = new URL(str);
    return url;
  } catch (_) {
    return;
  }
}

export function parseGitHubUrl(
  str: string,
):
  | { type: 'owner'; owner: string }
  | { type: 'repo'; owner: string; repo: string }
  | { type: 'issue'; owner: string; repo: string; number: number }
  | undefined {
  const url = getUrl(str);
  if (!url) {
    return;
  }
  if (url.hostname !== 'github.com') {
    return;
  }

  let pathname = url.pathname.slice(1);
  while (pathname.endsWith('/')) {
    pathname = pathname.slice(0, pathname.length - 1);
  }
  const splitted = pathname.split('/');
  if (splitted.length === 1) {
    console.log('is user or org');
    return {
      type: 'owner',
      owner: splitted[0],
    };
  } else if (splitted.length === 2) {
    console.log('is repo');
    return {
      type: 'repo',
      owner: splitted[0],
      repo: splitted[1],
    };
  } else if (splitted.length === 4) {
    console.log('sub');
    // https://github.com/opensumi/core/pull/2172
    return {
      type: 'issue',
      owner: splitted[0],
      repo: splitted[1],
      number: parseInt(splitted[3]),
    };
  }
}

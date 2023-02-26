import { EmitterWebhookEventName } from '@octokit/webhooks';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  Root,
  Content,
  Parent,
  Link,
  Text,
} from 'mdast-util-from-markdown/lib/index';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfm } from 'micromark-extension-gfm';

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

function createLink(title: string, url: string) {
  const text = `[${title}](${url})`;
  const tree = fromMarkdown(text, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  debugger;
  return tree;
}

function checkLinkIsLiteral(link: Link) {
  if (link.title !== null) {
    return false;
  }
  if (link.children.length !== 1) {
    return false;
  }
  if (link.children[0].type !== 'text') {
    return false;
  }
  const url = link.url;
  const urlLength = url.length;
  if (link.position && link.position.start.offset && link.position.end.offset) {
    const length = link.position.end.offset - link.position.start.offset;
    if (length === urlLength) {
      return true;
    }
  }
}

export function walk(root: Parent, cb: (token: Content) => boolean | void) {
  root.children.forEach((node) => {
    if (node) {
      const skip = cb(node);
      if (!skip) {
        if ((node as Parent).children) {
          walk(node as Parent, cb);
        }
      }
    }
  });
}

export function replaceGitHubUrlToMarkdown(
  text: string,
  options: ReplaceOptions,
) {
  const tree = fromMarkdown(text, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  walk(tree, (node) => {
    if (node.type === 'link') {
      if (checkLinkIsLiteral(node)) {
        debugger;
        console.log('literal', node);
        const url = node.url;
        const pull = new RegExp(
          `(https:\\/\\/github\\.com\\/(.*?)\\/(.*?)\\/pull\\/(\\d+))`,
        );
        const match = url.match(pull);
        if (match) {
          // url: 'https://github.com/opensumi/core/pull/1920'
          // match[1]: 'https://github.com/opensumi/core/pull/1920'
          // match[2]: 'opensumi'
          // match[3]: 'core'
          // match[4]: '1920'
          let title = `${match[2]}/${match[3]}#${match[4]}`;
          if (options.owner === match[2] && options.repo === match[3]) {
            title = `#${match[4]}`;
          }
          (node.children[0] as Text).value = title;
        }
        // https://github.com/opensumi/core/compare/v2.21.3...v2.21.4
        const compare = new RegExp(
          `(https:\\/\\/github\\.com\\/(.*?)\\/(.*?)\\/compare\\/(.*))`,
        );
        const match2 = url.match(compare);
        // url: 'https://github.com/opensumi/core/compare/v2.21.3...v2.21.4'
        // match2[1]: 'https://github.com/opensumi/core/compare/v2.21.3...v2.21.4'
        // match2[2]: 'opensumi'
        // match2[3]: 'core'
        // match2[4]: 'v2.21.3...v2.21.4'
        if (match2) {
          let title = `${match2[2]}/${match2[3]}:${match2[4]}`;
          if (options.owner === match2[2] && options.repo === match2[3]) {
            title = `${match2[4]}`;
          }
          (node.children[0] as Text).value = title;
        }
      }
      return true;
    }
  });
  text = toMarkdown(tree, {
    extensions: [gfmToMarkdown()],
    listItemIndent: 'one',
  });

  return text;
}

export function toDingtalkMarkdown(tree: Root) {
  return toMarkdown(tree, {
    extensions: [gfmToMarkdown()],
    listItemIndent: 'one',
    /**
     * DingTalk 突然间只支持这个了
     */
    fence: '~',
  });
}

export function standardizeMarkdown(text: string) {
  const tree = fromMarkdown(text, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  return toDingtalkMarkdown(tree);
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
  if (!setting.dingWebhooks || setting.dingWebhooks.length === 0) {
    console.error('no ding webhook setting, please check');
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

import { Link, Text } from 'mdast-util-from-markdown/lib/index';

import { makeMarkdown, parseMarkdown, walk } from './renderer/make-mark';

export const COMMENTS_START = '<!--';
export const COMMENTS_END = '-->';

interface ReplaceOptions {
  owner: string;
  repo: string;
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

export function replaceGitHubUrlToMarkdown(
  text: string,
  options: ReplaceOptions,
) {
  const tree = parseMarkdown(text);

  walk(tree, (node) => {
    if (node.type === 'link') {
      if (checkLinkIsLiteral(node)) {
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

  return makeMarkdown(tree);
}

export function replaceGitHubText(text: string) {
  // html 语法转为 markdown 语法
  if (text.includes('<img')) {
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

  // 移除 markdown 注释
  if (text.includes(COMMENTS_START)) {
    return text.replace(/(<!--[\s\S]*?-->)/g, '');
  }
  return text;
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
    // https://github.com/opensumi/core/pull/2172
    return {
      type: 'issue',
      owner: splitted[0],
      repo: splitted[1],
      number: parseInt(splitted[3]),
    };
  }
}

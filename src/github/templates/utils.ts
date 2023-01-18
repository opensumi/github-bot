import { Repository } from '@octokit/webhooks-types';
import _ from 'lodash';

import { StringBuilder } from '@/utils';

import { Context } from '../types';
import { replaceGitHubText } from '../utils';

export function renderRepoLink(repository: { name: string; html_url: string }) {
  return `[[${repository.name}]](${repository.html_url})`;
}

export function renderUserLink(sender: { login: string; html_url: string }) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderAtUserLink(sender: { login: string; html_url: string }) {
  return `[@${sender.login}](${sender.html_url})`;
}

export function renderPrOrIssueText(
  p: {
    /**
     * The title of the pull request.
     */
    title: string;
    /**
     * Number uniquely identifying the pull request within its repository.
     */
    number?: number;
  },
  prefix?: string,
  suffix?: string,
) {
  let text = `${prefix ?? ''}`;
  if (p.number) {
    text += `#${p.number} `;
  }
  text += p.title;
  if (suffix) {
    text += suffix;
  }
  return text;
}

export function renderPrOrIssueLink(
  p: {
    /**
     * The title of the pull request.
     */
    title: string;
    /**
     * Number uniquely identifying the pull request within its repository.
     */
    number?: number;
    html_url: string;
  },
  prefix?: string,
  suffix?: string,
) {
  return `[${renderPrOrIssueText(p, prefix, suffix)}](${p.html_url})`;
}

export function renderPrOrIssueTitleLink(p: {
  /**
   * The title of the pull request.
   */
  title: string;
  /**
   * Number uniquely identifying the pull request within its repository.
   */
  number: number;
  html_url: string;
  body?: string | null | undefined;
}) {
  return `> #### ${renderPrOrIssueLink(p)}`;
}

export function renderPrRefInfo(data: {
  head: {
    label: string;
  };
  base: {
    ref: string;
    user: {
      login: string;
    };
  };
}) {
  // display PR related info, such as pr assignees, base branch, head branch, etc.
  const head = data.head;
  const base = data.base;
  const headLabel = removeOrgInfo(base.user.login, head.label);
  return `> ${base.ref} <- ${headLabel}  `;
}

export function renderDeletedPrOrIssueTitleLink(p: {
  /**
   * The title of the pull request.
   */
  title: string;
  /**
   * Number uniquely identifying the pull request within its repository.
   */
  number: number;
  html_url: string;
  body: string | null | undefined;
}) {
  return `> #### ${renderPrOrIssueLink(p, '~~', '~~')}`;
}

export function renderPrOrIssueBody(
  p: {
    /**
     * The title of the pull request.
     */
    title: string;
    /**
     * Number uniquely identifying the pull request within its repository.
     */
    number: number;
    html_url: string;
    body?: string | null | undefined;
  },
  bodyLimit = -1,
) {
  const builder = new StringBuilder();

  if (p.body) {
    builder.add(`>`);
    builder.add(`${useRef(p.body, bodyLimit)}`);
  }

  return builder.build();
}

export function useRef(text?: string | null | undefined, bodyLimit = -1) {
  if (!text) {
    return '';
  }

  text = replaceGitHubText(text);

  if (bodyLimit && bodyLimit > 0) {
    text = limitTextByPosition(text, bodyLimit);
  }

  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const newLines = [];

  for (let line of arrayOfLines) {
    if (line) {
      if (line === '>') {
        line = '';
      } else if (line.startsWith('> ')) {
        line = line.substring(2);
      }
      newLines.push(`> ${line}`);
    } else {
      newLines.push(`>`);
    }
  }

  return newLines.join('\n');
}

const LIMIT_MIN_LINE = 3;

export function limitTextByPosition(text: string, position: number) {
  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');

  let count = 0;
  let lineNo = 0;
  for (; lineNo < arrayOfLines.length; lineNo++) {
    const line = arrayOfLines[lineNo];
    count += line.length;
    if (count >= position) {
      break;
    }
  }

  // 如果 limit 过后的行数小于 LIMIT_MIN_LINE，则使用 LIMIT_MIN_LINE
  lineNo = lineNo < LIMIT_MIN_LINE ? LIMIT_MIN_LINE : lineNo;

  const finalLines = arrayOfLines.slice(0, lineNo);
  let finalContent = finalLines.join('\n').trim();
  if (lineNo < arrayOfLines.length) {
    finalContent = finalContent + '...';
  }
  return finalContent;
}

export function limitLine(
  text: string,
  count: number,
  start = 0,
  lineProcess = (v: string) => v,
) {
  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const finalLines = arrayOfLines
    .slice(start, start + count)
    .map((v) => lineProcess(v));
  return finalLines.join('\n').trim();
}

export class StopHandleError extends Error {
  constructor(reason: string) {
    super(reason);
  }
}

type TitleTpl = (
  data: {
    repo: Repository;
    event: string;
    action: string;
  },
  ctx: Context,
  capitalize?: boolean,
) => string;

export const titleTpl: TitleTpl = (data, ctx, capitalize = true) => {
  let event = data.event;
  if (capitalize) {
    event = _.capitalize(event);
  }
  const info = `${event} ${data.action}`;
  let text;
  if (ctx.setting.notDisplayRepoName) {
    text = info;
  } else {
    text = `[${data.repo.name}] ${info}`;
  }
  return text;
};

type DetailTitleTpl = (
  data: {
    somebody: { login: string; html_url: string };
    did: {
      text: string;
      html_url?: string;
    };
    something: string | undefined;
    something1: {
      text: string;
      html_url?: string;
    };
  },
  ctx: Context,
) => string;

export const detailTitleTpl: DetailTitleTpl = (data) => {
  let text = `${renderUserLink(data.somebody)} [${data.did.text}](${
    data.did.html_url
  }) `;
  if (data.something) {
    text += `${data.something} on `;
  }
  text += `[${data.something1.text}](${data.something1.html_url})`;
  return text;
};

type TextTpl = (
  data: {
    repo: { name: string; html_url: string };
    title: string;
    body: string;
    notRenderBody?: boolean;
  },
  ctx?: {
    setting?: {
      notDisplayRepoName?: boolean;
    };
  },
) => string;

export const textTpl: TextTpl = (data, ctx) => {
  const { repo, title, body } = data;
  let repoInfo = renderRepoLink(repo) + ' ';
  if (ctx?.setting?.notDisplayRepoName) {
    repoInfo = '';
  }
  const text = new StringBuilder(`#### ${repoInfo}${title.trim()}  `);

  const bodyText = body.trim();

  if (!data.notRenderBody && bodyText) {
    text.addLineIfNecessary();
    text.addDivider();
    text.addLineIfNecessary();
    text.add(useRef(bodyText));
  }

  return text.toString();
};

export const removeOrgInfo = (orgName: string, label: string) => {
  const prefix = `${orgName}:`;
  if (label.startsWith(prefix)) {
    return label.slice(prefix.length);
  }
  return label;
};

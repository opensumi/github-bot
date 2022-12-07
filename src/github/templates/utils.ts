import { Repository } from '@octokit/webhooks-types';
import _ from 'lodash';

import { StringBuilder } from '@/utils';

import { Context } from '../types';
import { replaceGitHubText } from '../utils';

export function renderRepoLink(repository: Repository) {
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
  body: string | null;
}) {
  return `> #### ${renderPrOrIssueLink(p)}`;
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
  body: string | null;
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
    body: string | null;
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

export function useRef(text?: string | null, bodyLimit = -1) {
  if (!text) {
    return '';
  }

  text = replaceGitHubText(text);

  if (bodyLimit && bodyLimit > 0) {
    text = limitTextByPosition(text, bodyLimit);
  }

  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const newLines = [];

  for (const line of arrayOfLines) {
    newLines.push(`> ${line}`);
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
    repo: Repository;
    title: string;
    body: string;
    notRenderBody?: boolean;
  },
  ctx: Context,
) => string;

export const textTpl: TextTpl = (data, ctx) => {
  const { repo, title, body } = data;
  let repoInfo = renderRepoLink(repo) + ' ';
  if (ctx.setting.notDisplayRepoName) {
    repoInfo = '';
  }

  let text = `#### ${repoInfo}${title}  `;
  if (!data.notRenderBody) {
    text += `
${body}`;
  }

  return text;
};

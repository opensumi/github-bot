import { Repository, User } from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';
import _ from 'lodash';
import { Context } from '../app';

export function renderRepoLink(repository: Repository) {
  return `[[${repository.name}]](${repository.html_url})`;
}

export function renderUserLink(sender: User) {
  return `[${sender.login}](${sender.html_url})`;
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
) {
  let text = `${prefix ?? ''}`;
  if (p.number) {
    text += `#${p.number} `;
  }
  text += p.title;
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
) {
  return `[${renderPrOrIssueText(p, prefix)}](${p.html_url})`;
}

export function renderPrOrIssue(
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
  renderBody = true,
  bodyLimit = -1,
) {
  const builder = new StringBuilder(`> #### ${renderPrOrIssueLink(p)}`);

  if (renderBody && p.body) {
    builder.add(`>`);
    builder.add(`${useRef(p.body, bodyLimit)}`);
  }

  return builder.build();
}

export function useRef(text?: string | null, bodyLimit = -1) {
  if (!text) {
    return '';
  }

  if (bodyLimit && bodyLimit > 0) {
    text = limitTextByPostion(text, bodyLimit);
  }

  const arrayofLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const newLines = [];

  for (const line of arrayofLines) {
    newLines.push(`> ${line}`);
  }

  return newLines.join('\n');
}

const LIMIT_MIN_LINE = 3;

export function limitTextByPostion(text: string, position: number) {
  const arrayofLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');

  let count = 0;
  let lineNo = 0;
  for (; lineNo < arrayofLines.length; lineNo++) {
    const line = arrayofLines[lineNo];
    count += line.length;
    if (count >= position) {
      break;
    }
  }

  // 如果 limit 过后的行数小于 LIMIT_MIN_LINE，则使用 LIMIT_MIN_LINE
  lineNo = lineNo < LIMIT_MIN_LINE ? LIMIT_MIN_LINE : lineNo;

  const finalLines = arrayofLines.slice(0, lineNo);
  let finalContent = finalLines.join('\n').trim();
  if (lineNo < arrayofLines.length) {
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
  const arrayofLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const finalLines = arrayofLines
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
) => string;

export const titleTpl: TitleTpl = (data, ctx) => {
  const info = `${_.capitalize(data.event)} ${data.action}`;
  let text;
  if (ctx.setting.notDisplayRepoName) {
    text = info;
  } else {
    text = `[${data.repo.name}] ${info}`;
  }
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

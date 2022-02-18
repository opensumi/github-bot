import {
  Repository,
  User,
  Issue,
  PullRequest,
  Discussion,
} from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';
import _ from 'lodash';

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
    number: number;
  },
  prefix?: string,
) {
  return `${prefix ?? ''}#${p.number} ${p.title}`;
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
    number: number;
    html_url: string;
  },
  prefix?: string,
) {
  return `[${renderPrOrIssueText(p, prefix)}](${p.html_url})`;
}

export function renderPrOrIssue(
  p: PullRequest | Issue | Discussion,
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
  const finalLines = arrayofLines.slice(0, lineNo + 1);
  return finalLines.join('\n').trim();
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

type TitleTpl = (data: {
  repo: Repository;
  event: string;
  action: string;
}) => string;

export const titleTpl: TitleTpl = (data) => {
  return `[${data.repo.name}] ${_.capitalize(data.event)} ${data.action}`;
};

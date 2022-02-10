import {
  Repository,
  User,
  Issue,
  PullRequest,
  Discussion,
} from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';

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
) {
  const builder = new StringBuilder(`> #### ${renderPrOrIssueLink(p)}`);
  if (renderBody) {
    builder.add(`>`);
    builder.add(`${useRef(p.body)}`);
  }
  return builder.build();
}

export function useRef(text?: string | null) {
  if (!text) {
    return '';
  }

  const arrayofLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const newLines = [];

  for (const line of arrayofLines) {
    newLines.push(`> ${line}`);
  }

  return newLines.join('\n');
}

export function limitLine(text: string, count: number) {
  const arrayofLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const finalLines = arrayofLines.slice(0, count);
  return finalLines.join('\n').trim();
}

export class StopHandleError extends Error {
  constructor(reason: string) {
    super(reason);
  }
}

import capitalize from 'lodash/capitalize';

import { StringBuilder } from '@/utils/string-builder';

import { render } from '../render';
import { Context } from '../types';
import { replaceGitHubText } from '../utils';

export function renderRepoLink(repository: { name: string; html_url: string }) {
  return `[[${repository.name}]](${repository.html_url})`;
}

export function renderUserLink(sender: { login: string; html_url: string }) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderTeamLink(team: { name: string; html_url: string }) {
  return `[${team.name}](${team.html_url})`;
}

export function renderAtUserLink(sender: { login: string; html_url: string }) {
  return `[@${sender.login}](${sender.html_url})`;
}

export function renderReleaseLink(release: { name: string; html_url: string }) {
  return `[${release.name}](${release.html_url})`;
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

export function renderAssigneeInfo(
  assignees: {
    login: string;
    html_url: string;
  }[],
) {
  const assigneeNames = assignees.map((v) => renderUserLink(v)).join(', ');
  return `> Assignees: ${assigneeNames}  `;
}

interface ISenderBasic {
  login: string;
  html_url: string;
}

interface ITeamBasic {
  name: string;
  html_url: string;
}

export function renderRequestedReviewersInfo(
  reviewers: (ISenderBasic | ITeamBasic)[],
) {
  const reviewerNames = reviewers
    .map((v) =>
      (v as ISenderBasic).login
        ? renderUserLink(v as ISenderBasic)
        : renderTeamLink(v as ITeamBasic),
    )
    .join(', ');
  return `> Requested reviewers: ${reviewerNames}  `;
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
    builder.add(useRef(p.body, bodyLimit));
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

  for (const line of arrayOfLines) {
    if (line) {
      if (line === '>' || line.startsWith('> ')) {
        newLines.push(line);
        continue;
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

export type TextTplInput = {
  payload: any;
  title: string;
  compactTitle?: string;
  body: string;
  event: string;
  action: string;
  notCapitalizeTitle?: boolean;
  notRenderBody?: boolean;
};

type TextTpl = (
  data: TextTplInput,
  ctx?: {
    setting?: {
      notDisplayRepoName?: boolean;
    };
  },
) => {
  title: string;
  text: string;
  compactText?: string;
};

export type HandlerResult = {
  text: TextTplInput;
};

export const textTpl: TextTpl = (data, ctx) => {
  const {
    payload,
    title: bodyTitle,
    compactTitle,
    body,
    action,
    notCapitalizeTitle,
  } = data;
  const repo = payload.repository;

  let repoInfo = renderRepoLink(repo) + ' ';
  if (ctx?.setting?.notDisplayRepoName) {
    repoInfo = '';
  }

  const text = new StringBuilder(`#### ${repoInfo}${bodyTitle.trim()}  `);
  let compactText: StringBuilder | undefined;
  if (compactTitle) {
    compactText = new StringBuilder(compactTitle);
  }

  let bodyText = '';
  if (!data.notRenderBody) {
    bodyText = body.trim();
  }

  if (bodyText) {
    text.addDivider();
    text.add(useRef(bodyText));

    compactText && compactText.add(useRef(bodyText));
  }

  let event = data.event;
  if (!notCapitalizeTitle) {
    event = capitalize(event);
  }

  let title = `${event} ${action}`;
  if (!ctx?.setting?.notDisplayRepoName) {
    title = `[{{repository.name}}] ${title}`;
  }

  return {
    title: render(title, payload),
    text: text.render(payload),
    compactText: compactText ? compactText.render(payload) : undefined,
  };
};

export const removeOrgInfo = (orgName: string, label: string) => {
  const prefix = `${orgName}:`;
  if (label.startsWith(prefix)) {
    return label.slice(prefix.length);
  }
  return label;
};

/**
 * `not_planned` -> `not planned`
 */
export function prettyUnderlineWord(stateReason: string) {
  return stateReason.replace(/_/g, ' ');
}

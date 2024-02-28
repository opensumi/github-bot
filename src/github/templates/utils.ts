import capitalize from 'lodash/capitalize';

import { StringBuilder, limitTextByPosition } from '@/utils/string-builder';

import { render } from '../renderer';
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
  return `#### ${renderPrOrIssueLink(p)}`;
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
  return `${base.ref} <- ${headLabel}  `;
}

export function renderAssigneeInfo(
  assignees: {
    login: string;
    html_url: string;
  }[],
) {
  const assigneeNames = assignees.map((v) => renderUserLink(v)).join(', ');
  return `Assignees: ${assigneeNames}  `;
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
  return `Requested reviewers: ${reviewerNames}  `;
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
  return `#### ${renderPrOrIssueLink(p, '~~', '~~')}`;
}

export function renderPrOrIssueBody(p: {
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
  const builder = new StringBuilder();

  if (p.body) {
    builder.add(p.body);
  }

  return builder.build();
}

export function useRef(text?: string | null | undefined, bodyLimit = -1) {
  if (!text) {
    return '';
  }

  if (bodyLimit && bodyLimit > 0) {
    text = limitTextByPosition(text, bodyLimit);
  }

  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const newLines = [];

  for (const line of arrayOfLines) {
    if (line.trim()) {
      newLines.push(`> ${line}`);
    } else {
      newLines.push(`>`);
    }
  }

  return newLines.join('\n');
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
  target?: string;
  compactTitle?: string;
  body: string;
  event: string;
  action: string;
  contentLimit?: number;
  notCapitalizeTitle?: boolean;
  doNotRenderBody?: boolean;
  autoRef?: boolean;
};

type TextTpl = (
  data: TextTplInput,
  ctx?: {
    setting?: {
      notDisplayRepoName?: boolean;
    };
  },
  options?: {
    hooks?: {
      afterRender?: (result: string) => string;
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

const raw = (v: string) => v;

export const textTpl: TextTpl = (data, ctx, options) => {
  const {
    payload,
    title: bodyTitle,
    compactTitle,
    target,
    body,
    action,
    notCapitalizeTitle,
    autoRef,
    contentLimit = -1,
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

  if (target) {
    text.add(target);
    // compact text do not need target
  }

  let bodyText = '';
  if (!data.doNotRenderBody) {
    bodyText = render(body.trim(), payload);
  }

  if (bodyText) {
    text.addDivider('', true);

    if (contentLimit && contentLimit > 0) {
      bodyText = limitTextByPosition(bodyText, contentLimit);
    }

    payload.bodyText = bodyText;

    const refText = autoRef ? '{{bodyText|ref}}' : '{{bodyText}}';
    text.add(refText);
    compactText && compactText.add(refText);
  }

  let event = data.event;
  if (!notCapitalizeTitle) {
    event = capitalize(event);
  }

  let titleText = `${event} ${action}`;
  if (!ctx?.setting?.notDisplayRepoName) {
    titleText = `[{{repository.name}}] ${titleText}`;
  }

  const title = new StringBuilder(titleText);

  const afterRender = options?.hooks?.afterRender ?? raw;

  return {
    title: afterRender(title.render(payload)),
    text: afterRender(text.render(payload)),
    compactText: compactText
      ? afterRender(compactText.render(payload))
      : undefined,
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

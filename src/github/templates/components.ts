import capitalize from 'lodash/capitalize';

import { StringBuilder, limitTextByPosition } from '@/utils/string-builder';

import { render } from '../renderer';

export function RepositoryLink(repository: { name: string; html_url: string }) {
  return `[[${repository.name}]](${repository.html_url})`;
}

export function SenderLink(sender: { login: string; html_url: string }) {
  return `[${sender.login}](${sender.html_url})`;
}

export function TeamLink(team: { name: string; html_url: string }) {
  return `[${team.name}](${team.html_url})`;
}

export function AtSenderLink(sender: { login: string; html_url: string }) {
  return `[@${sender.login}](${sender.html_url})`;
}

export function ReleaseLink(release: { name: string; html_url: string }) {
  return `[${release.name}](${release.html_url})`;
}

export function IssuesText(
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

export function IssuesLink(
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
  return `[${IssuesText(p, prefix, suffix)}](${p.html_url})`;
}

export function IssuesTitleLink(p: {
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
  return `#### ${IssuesLink(p)}`;
}

export function PullRequestRefInfo(data: {
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

export function AssigneesInfo(
  assignees: {
    login: string;
    html_url: string;
  }[],
) {
  const assigneeNames = assignees.map((v) => SenderLink(v)).join(', ');
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

export function RequestedReviewersInfo(
  reviewers: (ISenderBasic | ITeamBasic)[],
) {
  const reviewerNames = reviewers
    .map((v) =>
      (v as ISenderBasic).login
        ? SenderLink(v as ISenderBasic)
        : TeamLink(v as ITeamBasic),
    )
    .join(', ');
  return `Requested reviewers: ${reviewerNames}  `;
}

export function DeletedPrOrIssueTitleLink(p: {
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
  return `#### ${IssuesLink(p, '~~', '~~')}`;
}

export function Reference(text?: string | null | undefined, bodyLimit = -1) {
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
  body?: string | null;
  event: string;
  action?: string;
  contentLimit?: number;
  notCapitalizeTitle?: boolean;
  doNotRenderBody?: boolean;
  autoRef?: boolean;
};

export type TemplateRenderResult = {
  title: string;
  text: string;
  compactText?: string;
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
) => TemplateRenderResult;

export type HandlerResult = {
  text: TextTplInput;
};

const raw = (v: string) => v;

export const Template: TextTpl = (data, ctx, options) => {
  const {
    payload,
    title: bodyTitle,
    compactTitle,
    target,
    body,
    notCapitalizeTitle,
    autoRef,
    contentLimit = -1,
  } = data;
  const action = data.action ?? payload.action;
  const repo = payload.repository;

  let repoInfo = RepositoryLink(repo) + ' ';
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
  if (body && !data.doNotRenderBody) {
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

const removeOrgInfo = (orgName: string, label: string) => {
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

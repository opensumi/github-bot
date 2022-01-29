import {
  Repository,
  User,
  Issue,
  PullRequest,
  Discussion,
} from '@octokit/webhooks-types';

export function renderRepoLink(repository: Repository) {
  return `[\[${repository.name}\]](${repository.html_url})`;
}

export function renderUserLink(sender: User) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderPrOrIssueText(p: PullRequest | Issue | Discussion) {
  return `\#${p.number} ${p.title}`;
}

export function renderPrOrIssueLink(p: PullRequest | Issue | Discussion) {
  return `[${renderPrOrIssueText(p)}](${p.html_url})`;
}

export function renderPrOrIssue(p: PullRequest | Issue | Discussion) {
  return `> #### ${renderPrOrIssueLink(p)}
>
${useRef(p.body)}`;
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

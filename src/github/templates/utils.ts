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
> ${p.body ?? ''}`;
}

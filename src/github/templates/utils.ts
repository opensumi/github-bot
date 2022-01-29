import { Repository, User, Issue, PullRequest } from '@octokit/webhooks-types';

export function renderRepoLink(repository: Repository) {
  return `[\[${repository.name}\]](${repository.html_url})`;
}

export function renderUserLink(sender: User) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderPrOrIssueText(p: PullRequest | Issue) {
  return `\#${p.number} ${p.title}`;
}

export function renderPrOrIssueLink(p: PullRequest | Issue) {
  return `[${renderPrOrIssueText(p)}](${p.html_url})`;
}

export function renderPrOrIssue(p: PullRequest | Issue) {
  return `> #### ${renderPrOrIssueLink(p)}
>
> ${p.body ?? ''}`;
}

import { Repository, User, Issue, PullRequest } from '@octokit/webhooks-types';

export function renderRepoLink(repository: Repository) {
  return `[\[${repository.full_name}\]](${repository.html_url})`;
}

export function renderUserLink(sender: User) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderPrOrIssueLink(p: PullRequest | Issue) {
  return `[\#${p.number} ${p.title}](${p.html_url})`;
}

export function renderPrOrIssue(p: PullRequest | Issue) {
  return `> #### ${renderPrOrIssueLink(p)}
>
> ${p.body ?? ''}`;
}

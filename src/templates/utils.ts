import { Repository, User, Issue } from '@octokit/webhooks-types';

export function renderRepoLink(repository: Repository) {
  return `[\[${repository.full_name}\]](${repository.html_url})`;
}

export function renderUserLink(sender: User) {
  return `[${sender.login}](${sender.html_url})`;
}

export function renderIssueLink(issue: Issue) {
  return `[\#${issue.number} ${issue.title}](${issue.html_url})`;
}

export function renderIssue(issue: Issue) {
  return `> #### ${renderIssueLink(issue)}
>
> ${issue.body ?? ''}`;
}

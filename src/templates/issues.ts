import type { ExtractPayload } from '../template';
import { renderRepoLink, renderUserLink, renderIssue } from './utils';

export function issuesOpened(payload: ExtractPayload<'issues.opened'>) {
  const issue = payload.issue;
  return {
    title: `Issue opened: \#${issue.number} ${issue.title}`,
    text: `${renderRepoLink(
      payload.repository,
    )} Issue opened by ${renderUserLink(payload.sender)}

${renderIssue(issue)}`,
  };
}

export function issuesEdited(payload: ExtractPayload<'issues.edited'>) {
  const issue = payload.issue;
  return {
    title: `Issue edited: \#${issue.number} ${issue.title}`,
    text: `${renderRepoLink(
      payload.repository,
    )} Issue edited by ${renderUserLink(
      payload.sender,
    )}, author: ${renderUserLink(issue.user)}

${renderIssue(issue)}`,
  };
}

export function issuesReopened(payload: ExtractPayload<'issues.reopened'>) {
  const issue = payload.issue;
  return {
    title: `Issue reopened: \#${issue.number} ${issue.title}`,
    text: `${renderRepoLink(
      payload.repository,
    )} Issue reopened by ${renderUserLink(
      payload.sender,
    )}, created by ${renderUserLink(issue.user)}

${renderIssue(issue)}`,
  };
}

export function issuesClosed(payload: ExtractPayload<'issues.closed'>) {
  const issue = payload.issue;
  return {
    title: `Issue closed: \#${issue.number} ${issue.title}`,
    text: `${renderRepoLink(
      payload.repository,
    )} Issue closed by ${renderUserLink(
      payload.sender,
    )}, author: ${renderUserLink(issue.user)}

${renderIssue(issue)}`,
  };
}

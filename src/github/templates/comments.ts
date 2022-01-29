import {
  renderPrOrIssueLink,
  renderPrOrIssueText,
  renderRepoLink,
  renderUserLink,
} from '.';
import { ExtractPayload } from '../template';

export function handleIssueComment(payload: ExtractPayload<'issue_comment'>) {
  const issue = payload.issue;
  const action = payload.action;
  const comment = payload.comment;
  const isUnderPullRequest = Boolean(issue.pull_request);
  let location = 'issue';
  if (isUnderPullRequest) {
    location = 'pull request';
  }
  const title = `Comment ${action} on ${location} ${renderPrOrIssueText(
    payload.issue,
  )}`;
  const text = `${renderRepoLink(payload.repository)} [Comment](${
    comment.html_url
  }) ${action} by ${renderUserLink(
    payload.sender,
  )} on ${location} ${renderPrOrIssueLink(payload.issue)}
>
> ${comment.body}
`;
  return {
    title,
    text,
  };
}

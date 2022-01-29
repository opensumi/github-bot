import {
  renderPrOrIssueLink,
  renderPrOrIssueText,
  renderRepoLink,
  renderUserLink,
  useRef,
} from '.';
import { ExtractPayload } from '../template';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

type Name = 'issues' | 'pull_request' | 'discussion';
const NameBlock = {
  issues: 'Issue',
  pull_request: 'Pull Request',
  discussion: 'Discussion',
} as {
  [key in Name]: string;
};

function renderComment(
  name: Name,
  payload: ExtractPayload<'issue_comment' | 'discussion_comment'>,
  data: Issue | PullRequest | Discussion,
  comment: {
    html_url: string;
    body: string;
  },
) {
  const location = NameBlock[name];
  const action = payload.action;
  const title = `[${
    payload.repository.name
  }] Comment ${action} on ${location} ${renderPrOrIssueText(data)}`;
  const text = `${renderRepoLink(payload.repository)} [Comment](${
    comment.html_url
  }) ${action} by ${renderUserLink(
    payload.sender,
  )} on ${location} ${renderPrOrIssueLink(data)}
>
${useRef(comment.body)}
`;
  return {
    title,
    text,
  };
}

export function handleIssueComment(payload: ExtractPayload<'issue_comment'>) {
  const issue = payload.issue;
  const isUnderPullRequest = Boolean(issue.pull_request);
  let name = 'issues' as Name;
  if (isUnderPullRequest) {
    name = 'pull_request';
  }
  return renderComment(name, payload, issue, payload.comment);
}

export function handleDiscussionComment(
  payload: ExtractPayload<'discussion_comment'>,
) {
  return renderComment(
    'discussion',
    payload,
    payload.discussion,
    payload.comment,
  );
}

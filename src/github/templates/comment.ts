import {
  limitLine,
  renderPrOrIssueLink,
  renderPrOrIssueText,
  renderRepoLink,
  renderUserLink,
  useRef,
} from '.';
import { ExtractPayload } from '@/github/types';
import { Issue, PullRequest, Discussion, User } from '@octokit/webhooks-types';

type Name = 'issues' | 'pull_request' | 'discussion';
const NameBlock = {
  issues: 'issue',
  pull_request: 'pull request',
  discussion: 'discussion',
} as {
  [key in Name]: string;
};

const formatByUserLogin = {
  'codecov-commenter': (text: string) => {
    return limitLine(text, 3);
  },
} as {
  [key: string]: (text: string) => string;
};

function renderCommentBody(comment: { body: string; user: User }) {
  let text = useRef(comment.body);
  const formatter = formatByUserLogin[comment.user.login];
  if (formatter) {
    text = formatter(text);
  }
  return text;
}

function renderComment(
  name: Name,
  payload: ExtractPayload<'issue_comment' | 'discussion_comment'>,
  data: Issue | PullRequest | Discussion,
) {
  const comment = payload.comment;
  const location = NameBlock[name];
  const action = payload.action;
  let shouldRenderBody = true;
  if (['edited'].includes(action)) {
    shouldRenderBody = false;
  }

  const title = `[${
    payload.repository.name
  }] comment ${action} on ${location} ${renderPrOrIssueText(data)}`;
  const text = `${renderRepoLink(payload.repository)} ${renderUserLink(
    payload.sender,
  )} ${action} [comment](${
    comment.html_url
  }) on ${location} ${renderPrOrIssueLink(data)}${
    shouldRenderBody ? `\n>\n${renderCommentBody(payload.comment)}` : ''
  }
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
  return renderComment(name, payload, issue);
}

export function handleDiscussionComment(
  payload: ExtractPayload<'discussion_comment'>,
) {
  return renderComment('discussion', payload, payload.discussion);
}

export function handleCommitComment(payload: ExtractPayload<'commit_comment'>) {
  const comment = payload.comment;
  const commitId = comment.commit_id.slice(0, 6);
  const action = payload.action;

  const title = `[${payload.repository.name}] commit comment ${action} on commit@${commitId}`;
  const text = `${renderRepoLink(payload.repository)} ${renderUserLink(
    payload.sender,
  )} ${action} [commit comment](${comment.html_url}) on [${
    payload.repository.name
  }@${commitId}](${comment.html_url})
>\n
${renderCommentBody(payload.comment)}
`;
  return {
    title,
    text,
  };
}

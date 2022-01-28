import type { ExtractPayload } from '../template';
import {
  renderRepoLink,
  renderUserLink,
  renderPrOrIssue,
  renderPrOrIssueLink,
} from './utils';
import { Issue, PullRequest } from '@octokit/webhooks-types';

type Name = 'issues' | 'pull_request';
const NameBlock = {
  issues: 'Issue',
  pull_request: 'Pull Request',
} as {
  [key in Name]: string;
};

function render(
  name: Name,
  payload: ExtractPayload<Name>,
  data: PullRequest | Issue,
) {
  const nameBlock = NameBlock[name];
  const action = payload.action.replaceAll('_', '');
  const sender = renderUserLink(payload.sender);
  const originAuthor = renderUserLink(data.user);

  let shouldRenderOriginAuthor = false;
  if (action !== 'opened') {
    shouldRenderOriginAuthor = true;
  }

  const title = `${nameBlock} ${renderPrOrIssueLink(
    data,
  )} ${action} by ${sender}`;

  const text = `${renderRepoLink(
    payload.repository,
  )} ${nameBlock} ${action} by ${renderUserLink(payload.sender)}${
    shouldRenderOriginAuthor ? `, author: ${originAuthor}` : ''
  }

${renderPrOrIssue(data)}`;

  return {
    title,
    text,
  };
}

export function handlePr(payload: ExtractPayload<'pull_request'>) {
  return render('pull_request', payload, payload.pull_request);
}

export function handleIssue(payload: ExtractPayload<'issues'>) {
  return render('issues', payload, payload.issue);
}

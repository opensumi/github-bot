import type { ExtractPayload } from '../template';
import {
  renderRepoLink,
  renderUserLink,
  renderPrOrIssue,
  renderPrOrIssueText,
} from './utils';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

type Name = 'issues' | 'pull_request' | 'discussion';
const NameBlock = {
  issues: 'Issue',
  pull_request: 'Pull Request',
  discussion: 'Discussion',
} as {
  [key in Name]: string;
};

function render(
  name: Name,
  payload: ExtractPayload<Name>,
  data: PullRequest | Issue | Discussion,
) {
  const nameBlock = NameBlock[name];
  const action = payload.action.replaceAll('_', '');

  let shouldRenderOriginAuthor = false;
  if (action !== 'opened') {
    shouldRenderOriginAuthor = true;
  }
  let shouldRenderBody = true;
  if (action === 'closed') {
    shouldRenderBody = false;
  }

  const title = `[${
    payload.repository.name
  }] ${nameBlock} ${renderPrOrIssueText(data)} ${action} by ${
    payload.sender.login
  }`;

  let text = `${renderRepoLink(payload.repository)} [${nameBlock}](${
    data.html_url
  }) ${action} by ${renderUserLink(payload.sender)}`;

  if (shouldRenderOriginAuthor) {
    text += `, author: ${renderUserLink(data.user)}`;
  }

  if (shouldRenderBody) {
    text += `\n\n${renderPrOrIssue(data)}`;
  }

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

export function handleDiscussion(payload: ExtractPayload<'discussion'>) {
  return render('discussion', payload, payload.discussion);
}

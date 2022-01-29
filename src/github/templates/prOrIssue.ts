import type { ExtractPayload } from '../template';
import {
  renderRepoLink,
  renderUserLink,
  renderPrOrIssue,
  renderPrOrIssueText,
} from './utils';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

interface ChangeItem {
  from: string;
}

interface Changes {
  body?: ChangeItem;
  title?: ChangeItem;
}

type Name = 'issues' | 'pull_request' | 'discussion';
const NameBlock = {
  issues: 'issue',
  pull_request: 'pull request',
  discussion: 'discussion',
} as {
  [key in Name]: string;
};

function render(
  name: Name,
  payload: ExtractPayload<Name>,
  data: PullRequest | Issue | Discussion,
) {
  const nameBlock = NameBlock[name];
  let action = payload.action.replaceAll('_', '');

  let shouldRenderOriginAuthor = false;
  if (action !== 'opened') {
    shouldRenderOriginAuthor = true;
  }
  let shouldRenderBody = true;
  if (action === 'closed') {
    shouldRenderBody = false;
  }

  let oldTitle = '';

  if ((payload as any).changes) {
    const changes = (payload as any).changes as Changes;
    if (changes?.title) {
      // 说明是标题改变
      oldTitle = changes.title.from;
      action = 'changed title';
    }
  }

  const title = `[${
    payload.repository.name
  }] ${nameBlock} ${renderPrOrIssueText(data)} ${action} by ${
    payload.sender.login
  }`;

  let text = `${renderRepoLink(payload.repository)} [${nameBlock}#${
    data.number
  }](${data.html_url}) ${action} by ${renderUserLink(payload.sender)}`;

  const subline = [] as string[];
  if (shouldRenderOriginAuthor) {
    subline.push(`author: ${renderUserLink(data.user)}`);
  }
  if (oldTitle) {
    subline.push(`old title: ${oldTitle}`);
  }
  text += '\n\n' + subline.join(', ') + '\n\n';
  text += `\n\n${renderPrOrIssue(data, shouldRenderBody)}`;

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

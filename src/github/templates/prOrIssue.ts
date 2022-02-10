import { ExtractPayload, THasChanges } from '../types';
import { renderRepoLink, renderUserLink, renderPrOrIssue } from './utils';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';
import { StopHandleError } from '.';
import { capitalize } from 'lodash';

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
    if (data.user.name !== payload.sender.name) {
      shouldRenderOriginAuthor = true;
    }
  }

  let shouldRenderBody = true;
  if (['closed', 'edited'].includes(action)) {
    shouldRenderBody = false;
  }

  const subline = [] as string[];

  let firstLineSuffix = '';

  if (action === 'edited') {
    if ((payload as THasChanges).changes) {
      const changes = (payload as THasChanges).changes;
      if (changes?.title) {
        // 说明是标题改变
        action = 'changed title';
        firstLineSuffix = ' from ' + changes.title.from;
      } else {
        throw new StopHandleError('ignore prOrIssue content change');
      }
    }
  }

  if (shouldRenderOriginAuthor) {
    subline.push(`Author: ${renderUserLink(data.user)}`);
  }

  if (name === 'pull_request' && action === 'closed') {
    const pr = (payload as ExtractPayload<'pull_request.closed'>).pull_request;
    if (pr.merged) {
      // If the action is closed and the merged key is true, the pull request was merged.
      action = 'merged';
    }
  }

  const title = `[${payload.repository.name}] ${capitalize(nameBlock)}#${
    data.number
  } ${action}`;
  const builder = new StringBuilder(
    `${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )} ${action} [${nameBlock}#${data.number}](${
      data.html_url
    })${firstLineSuffix}`,
  );

  if (subline.length > 0) {
    builder.add(subline.join(', '), true);
  }
  builder.add(renderPrOrIssue(data, shouldRenderBody));

  return {
    title,
    text: builder.build(),
  };
}

export async function handlePr(payload: ExtractPayload<'pull_request'>) {
  return render('pull_request', payload, payload.pull_request);
}

export async function handleIssue(payload: ExtractPayload<'issues'>) {
  return render('issues', payload, payload.issue);
}

export async function handleDiscussion(payload: ExtractPayload<'discussion'>) {
  return render('discussion', payload, payload.discussion);
}

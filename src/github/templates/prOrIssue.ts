import { ExtractPayload } from '../types';
import { renderRepoLink, renderUserLink, renderPrOrIssue } from './utils';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';
import { titleTpl } from './trivias';
import { Context } from '../app';

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
  ctx: Context,
) {
  const nameBlock = NameBlock[name];
  let action = payload.action.replaceAll('_', '');

  let shouldRenderBody = true;
  if (['closed', 'edited'].includes(action)) {
    shouldRenderBody = false;
  }

  const subline = [] as string[];

  if (name === 'pull_request' && action === 'closed') {
    const pr = (payload as ExtractPayload<'pull_request.closed'>).pull_request;
    if (pr.merged) {
      // If the action is closed and the merged key is true, the pull request was merged.
      action = 'merged';
    }
  }

  const title = titleTpl({
    repo: payload.repository,
    event: `${nameBlock}#${data.number}`,
    action,
  });

  const builder = new StringBuilder(
    `#### ${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )} ${action} [${nameBlock}#${data.number}](${data.html_url})`,
  );

  if (subline.length > 0) {
    builder.add(subline.join(', '), true);
  }
  builder.add(
    renderPrOrIssue(data, shouldRenderBody, ctx.dingSecret.contentLimit),
  );

  return {
    title,
    text: builder.build(),
  };
}

export async function handlePr(
  payload: ExtractPayload<'pull_request'>,
  ctx: Context,
) {
  return render('pull_request', payload, payload.pull_request, ctx);
}

export async function handleIssue(
  payload: ExtractPayload<'issues'>,
  ctx: Context,
) {
  return render('issues', payload, payload.issue, ctx);
}

export async function handleDiscussion(
  payload: ExtractPayload<'discussion'>,
  ctx: Context,
) {
  return render('discussion', payload, payload.discussion, ctx);
}

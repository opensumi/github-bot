import { ExtractPayload } from '../types';
import { renderUserLink, renderPrOrIssue, titleTpl } from './utils';
import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';
import { StringBuilder } from '@/utils';
import { Context } from '../app';
import { textTpl } from '.';

export type Name = 'issues' | 'pull_request' | 'discussion';
export const NameBlock = {
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
  let action = payload.action as string;

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

  const builder = new StringBuilder();

  if (subline.length > 0) {
    builder.add(subline.join(', '), true);
  }
  builder.add(
    renderPrOrIssue(data, shouldRenderBody, ctx.setting.contentLimit),
  );

  const text = textTpl(
    {
      title: `${renderUserLink(payload.sender)} ${action} [${nameBlock}](${
        data.html_url
      })`,
      body: builder.build(),
      repo: payload.repository,
    },
    ctx,
  );

  return {
    title,
    text,
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

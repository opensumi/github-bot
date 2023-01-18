import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

import { StringBuilder } from '@/utils';

import { ExtractPayload, THasChanges, Context } from '../types';

import {
  renderUserLink,
  renderPrOrIssueTitleLink,
  renderDeletedPrOrIssueTitleLink,
  titleTpl,
  renderPrOrIssueBody,
  StopHandleError,
  renderPrRefInfo,
} from './utils';

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
  data: Issue | Discussion,
  ctx: Context,
) {
  const nameBlock = NameBlock[name];
  const action = payload.action as string;

  let shouldRenderBody = true;
  if (['closed', 'edited'].includes(action)) {
    shouldRenderBody = false;
  }

  const builder = new StringBuilder();

  builder.add(renderPrOrIssueTitleLink(data));

  const title = titleTpl(
    {
      repo: payload.repository,
      event: `${nameBlock}#${data.number}`,
      action,
    },
    ctx,
  );

  if (shouldRenderBody && data.body) {
    builder.addDivider('> ');
    builder.add(renderPrOrIssueBody(data, ctx.setting.contentLimit));
  }

  let textFirstLine = `${renderUserLink(
    payload.sender,
  )} ${action} [${nameBlock}](${data.html_url})`;

  if ((data as Issue).state_reason) {
    textFirstLine += ` as ${(data as Issue).state_reason}`;
  }

  const text = textTpl(
    {
      title: textFirstLine,
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
  const nameBlock = 'pull request';
  const data = payload.pull_request;
  let action = payload.action as string;

  let shouldRenderBody = true;
  if (['closed', 'edited'].includes(action)) {
    shouldRenderBody = false;
  }

  let shouldRenderMergeInfo = false;
  if (['opened', 'edited'].includes(action)) {
    shouldRenderMergeInfo = true;
  }

  const builder = new StringBuilder();

  if (action === 'closed') {
    const pr = (payload as ExtractPayload<'pull_request.closed'>).pull_request;
    if (pr.merged) {
      // If the action is closed and the merged key is true, the pull request was merged.
      action = 'merged';
    }
  }

  if (action === 'ready_for_review') {
    action = 'ready for review';
  }
  const base = (data as PullRequest).base;

  let oldTitle = '';
  let oldRef = '';
  if (action === 'edited') {
    if ((payload as THasChanges).changes) {
      const changes = (payload as THasChanges).changes;
      if (changes?.title) {
        // 说明是标题改变
        // 我们只接收标题带有 WIP 的改变
        if (
          changes.title.from.toLowerCase().includes('wip') &&
          !data.title.toLowerCase().includes('wip')
        ) {
          oldTitle = changes.title.from;
        }
        if (
          !changes.title.from.toLowerCase().includes('wip') &&
          data.title.toLowerCase().includes('wip')
        ) {
          oldTitle = changes.title.from;
        }
      }
      if (changes?.base) {
        oldRef = changes.base.ref.from;
      }
    }

    if (!oldRef && !oldTitle) {
      throw new StopHandleError('ignore pr content change');
    }
  }

  if (oldTitle) {
    builder.add(
      renderDeletedPrOrIssueTitleLink({
        ...data,
        title: oldTitle,
      }),
    );
  }

  builder.add(renderPrOrIssueTitleLink(data));

  if (shouldRenderMergeInfo) {
    builder.add(renderPrRefInfo(data));
  }

  if (oldRef) {
    builder.add(
      `> changed the base branch from \`${oldRef}\` to \`${base.ref}\`  `,
    );
  }

  const title = titleTpl(
    {
      repo: payload.repository,
      event: `${nameBlock}#${data.number}`,
      action,
    },
    ctx,
  );

  if (shouldRenderBody && data.body) {
    builder.addDivider('> ');
    builder.add(renderPrOrIssueBody(data, ctx.setting.contentLimit));
  }

  const firstLine = `${renderUserLink(
    payload.sender,
  )} ${action} [${nameBlock}](${data.html_url})`;

  const text = textTpl(
    {
      title: firstLine,
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

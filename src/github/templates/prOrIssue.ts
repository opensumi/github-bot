import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

import { StringBuilder } from '@/utils/string-builder';

import {
  ExtractPayload,
  THasChanges,
  Context,
  TemplateRenderResult,
} from '../types';

import {
  renderPrOrIssueTitleLink,
  renderDeletedPrOrIssueTitleLink,
  renderPrOrIssueBody,
  StopHandleError,
  renderPrRefInfo,
  renderAssigneeInfo,
  renderRequestedReviewersInfo,
  textTpl,
  prettyUnderlineWord,
} from './utils';

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
): TemplateRenderResult {
  const nameBlock = NameBlock[name];
  const action = payload.action as string;

  let shouldRenderAssigneeInfo = false;
  if (['opened', 'edited'].includes(action)) {
    shouldRenderAssigneeInfo = true;
  }

  let shouldRenderBody = true;
  if (['closed', 'edited'].includes(action)) {
    shouldRenderBody = false;
  }

  const builder = new StringBuilder();

  builder.add(renderPrOrIssueTitleLink(data));

  let contentLimit = ctx.setting.contentLimit;

  if (name === 'issues') {
    // if the issue has label `monthly-report`, we will render all content
    if (
      (data as Issue).labels?.find(
        (v) => v.name && v.name.includes('monthly-report'),
      )
    ) {
      contentLimit = -1;
    }

    if (shouldRenderAssigneeInfo && (data as Issue).assignees?.length) {
      builder.add(renderAssigneeInfo((data as Issue).assignees));
    }
  }

  if (shouldRenderBody && data.body) {
    builder.addDivider('> ', true);
    builder.add(renderPrOrIssueBody(data, contentLimit));
  }

  let textFirstLine = `{{sender | link:sender}} ${action} [${nameBlock}](${data.html_url})`;

  if ((data as Issue).state_reason) {
    textFirstLine += ` as ${prettyUnderlineWord(
      (data as Issue).state_reason!,
    )}`;
  }

  const text = textTpl(
    {
      payload,
      event: `${nameBlock}#${data.number}`,
      action,
      title: textFirstLine,
      body: builder.build(),
    },
    ctx,
  );

  return text;
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

  let shouldRenderMergeInfo = false;
  if (['opened', 'edited', 'merged'].includes(action)) {
    shouldRenderMergeInfo = true;
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

  if (data.requested_reviewers?.length) {
    builder.add(renderRequestedReviewersInfo(data.requested_reviewers));
  }

  if (data.assignees?.length) {
    builder.add(renderAssigneeInfo(data.assignees));
  }

  if (oldRef) {
    builder.add(
      `> changed the base branch from \`${oldRef}\` to \`${base.ref}\`  `,
    );
  }

  if (shouldRenderBody && data.body) {
    builder.addDivider('> ', true);
    builder.add(renderPrOrIssueBody(data, ctx.setting.contentLimit));
  }

  const text = textTpl(
    {
      payload,
      event: `${nameBlock}#${data.number}`,
      action,
      title: `{{sender | link:sender}} ${action} [${nameBlock}](${data.html_url})`,
      body: builder.build(),
    },
    ctx,
  );

  return text;
}

export async function handleIssue(
  payload: ExtractPayload<'issues'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  return render('issues', payload, payload.issue, ctx);
}

export async function handleDiscussion(
  payload: ExtractPayload<'discussion'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  return render('discussion', payload, payload.discussion, ctx);
}

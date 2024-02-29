import { Issue, PullRequest, Discussion } from '@octokit/webhooks-types';

import { StringBuilder } from '@/utils/string-builder';

import { ExtractPayload, THasChanges, Context } from '../types';

import {
  IssuesTitleLink,
  DeletedPrOrIssueTitleLink,
  StopHandleError,
  PullRequestRefInfo,
  AssigneesInfo,
  RequestedReviewersInfo,
  Template,
  prettyUnderlineWord,
  TemplateRenderResult,
} from './components';

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

  builder.add(IssuesTitleLink(data));

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
      builder.add('> ' + AssigneesInfo((data as Issue).assignees));
    }
  }

  let title = `{{sender | link:sender}} ${action} [${nameBlock}](${data.html_url})`;

  if ((data as Issue).state_reason) {
    title += ` as ${prettyUnderlineWord((data as Issue).state_reason!)}`;
  }

  return Template(
    {
      payload,
      event: `${nameBlock}#${data.number}`,
      action,
      title,
      target: builder.build(),
      body: data.body,
      contentLimit,
      doNotRenderBody: !shouldRenderBody,
    },
    ctx,
  );
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

  // ready_for_review -> ready for review
  action = prettyUnderlineWord(action);

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
      DeletedPrOrIssueTitleLink({
        ...data,
        title: oldTitle,
      }),
    );
  }

  builder.add(IssuesTitleLink(data));

  if (shouldRenderMergeInfo) {
    builder.add(`> ${PullRequestRefInfo(data)}`);
  }

  if (data.requested_reviewers?.length) {
    builder.add(`> ${RequestedReviewersInfo(data.requested_reviewers)}`);
  }

  if (data.assignees?.length) {
    builder.add(`> ${AssigneesInfo(data.assignees)}`);
  }

  if (oldRef) {
    builder.add(
      `> changed the base branch from \`${oldRef}\` to \`${base.ref}\`  `,
    );
  }

  return Template(
    {
      payload,
      event: `${nameBlock}#${data.number}`,
      action,
      title: `{{sender | link:sender}} ${action} [${nameBlock}](${data.html_url})`,
      target: builder.build(),
      body: data.body,
      contentLimit: ctx.setting.contentLimit,
      doNotRenderBody: !shouldRenderBody,
    },
    ctx,
  );
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

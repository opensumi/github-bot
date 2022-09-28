import { ExtractPayload, THasChanges } from '../types';
import {
  renderUserLink,
  renderPrOrIssueTitleLink,
  titleTpl,
  renderPrOrIssueBody,
  StopHandleError,
} from './utils';
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

const removeOrgInfo = (orgName: string, label: string) => {
  const prefix = `${orgName}:`;
  if (label.startsWith(prefix)) {
    return label.slice(prefix.length);
  }
  return label;
};

function render(
  name: Name,
  payload: ExtractPayload<Name>,
  data: PullRequest | Issue | Discussion,
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

  if (shouldRenderBody) {
    builder.add(renderPrOrIssueBody(data, ctx.setting.contentLimit));
  }

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
  let oldTitle = '';
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

  builder.add(renderPrOrIssueTitleLink(data));

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

  if (action === 'edited') {
    if ((payload as THasChanges).changes) {
      const changes = (payload as THasChanges).changes;
      if (changes?.title) {
        // 说明是标题改变
        oldTitle = changes.title.from;
        action = 'changed title';
      } else {
        throw new StopHandleError('ignore prOrIssue content change');
      }
      if (
        !oldTitle.toLowerCase().includes('wip') &&
        !data.title.toLowerCase().includes('wip')
      ) {
        throw new StopHandleError('only handle wip changes');
      }
    }
  }

  if (oldTitle) {
    builder.add(`> **from:** ${oldTitle}`);
  }

  if (shouldRenderMergeInfo) {
    // display PR related info, such as pr assignees, base branch, head branch, etc.
    const base = (data as PullRequest).base;
    const head = (data as PullRequest).head;
    const headLabel = removeOrgInfo(base.user.login, head.label);
    builder.add(`> ${base.ref} <- ${headLabel}`);
  }

  builder.add('');
  builder.add('---');

  const title = titleTpl(
    {
      repo: payload.repository,
      event: `${nameBlock}#${data.number}`,
      action,
    },
    ctx,
  );

  if (shouldRenderBody) {
    builder.add(renderPrOrIssueBody(data, ctx.setting.contentLimit));
  }

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

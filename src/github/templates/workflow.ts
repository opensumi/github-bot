import { Octokit } from '@octokit/rest';

import { StringBuilder } from '@/utils';

import { Context, ExtractPayload, MarkdownContent } from '../types';

import { renderUserLink, titleTpl, textTpl, StopHandleError } from '.';

export async function handleWorkflowRun(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): Promise<MarkdownContent> {
  const workflow = payload.workflow;
  const workflowRun = payload.workflow_run;
  const action = payload.action as string;
  const repository = payload.repository;
  if (!workflowRun.path) {
    throw new StopHandleError('need workflow path');
  }

  if (!ctx.octokit) {
    throw new StopHandleError('should have ctx octokit');
  }

  // 下面就是通知 Workflow 结果的 actions
  if (
    repository.full_name === 'opensumi/actions' &&
    workflow.name === 'sync to npmmirror'
  ) {
    const title = titleTpl(
      {
        repo: payload.repository,
        event: 'workflow',
        action,
      },
      ctx,
    );

    const builder = new StringBuilder();

    builder.add(`Name: ${workflow.name}\n`);
    builder.add(`Conclusion: ${workflowRun.conclusion}`);
    builder.add(`[Click me to see detail](${workflowRun.html_url})\n`);

    const text = textTpl(
      {
        title: `[workflow](${workflowRun.html_url}) ${
          workflowRun.status
        } (created by ${renderUserLink(payload.sender)})`,
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

  throw new StopHandleError(
    'only selected path allow to run, receive path: ' + workflowRun.path,
  );
}

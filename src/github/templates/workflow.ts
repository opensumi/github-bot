import { StringBuilder } from '@/utils';
import { renderUserLink, titleTpl, textTpl, StopHandleError } from '.';
import { Context } from '../app';
import { ExtractPayload, MarkdownContent } from '../types';
import { Octokit } from '@octokit/rest';

const workflowToHandle = new Set(['.github/workflows/manual-release-rc.yml']);

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

  if (!workflowToHandle.has(workflowRun.path)) {
    throw new StopHandleError(
      'only selected path allow to run, receive path: ' + workflowRun.path,
    );
  }

  if (!ctx.octokit) {
    throw new StopHandleError('should have ctx octokit');
  }

  const checkRunsData = await ctx.octokit.checks.listForSuite({
    owner: repository.owner.login,
    repo: repository.name,
    check_suite_id: workflowRun.check_suite_id,
  });

  const runs = checkRunsData.data.check_runs;

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

  for (const run of runs) {
    builder.add(`Run: ${run.name}  \n\n`);
  }

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

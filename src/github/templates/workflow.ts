import { Octokit } from '@octokit/rest';

import { StringBuilder } from '@/utils';

import { Context, ExtractPayload, MarkdownContent } from '../types';

import { renderAtUserLink, titleTpl, textTpl, StopHandleError } from '.';

function renderWorkflow(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): MarkdownContent {
  const workflow = payload.workflow;
  const workflowRun = payload.workflow_run;
  const action = payload.action as string;

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

  const status = workflowRun.conclusion;

  builder.add(`[Detail](${workflowRun.html_url})\n`);

  const text = textTpl(
    {
      title: `[workflow](${
        workflowRun.html_url
      }) run ${status} (${renderAtUserLink(payload.sender)})`,
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

export async function handleWorkflowRun(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): Promise<MarkdownContent> {
  const workflow = payload.workflow;
  const workflowRun = payload.workflow_run;
  const repository = payload.repository;
  if (!workflowRun.path) {
    throw new StopHandleError('need workflow path');
  }

  if (!ctx.octokit) {
    throw new StopHandleError('should have ctx octokit');
  }

  const mapping = {
    'opensumi/actions': ['sync to npmmirror'],
    'opensumi/core': ['Release RC Version'],
  } as Partial<Record<string, string[]>>;

  const repoAllow = mapping[repository.full_name];

  if (repoAllow) {
    const allow = repoAllow.includes(workflow.name);
    if (allow) {
      return renderWorkflow(payload, ctx);
    }
  }

  throw new StopHandleError(
    'only selected path allow to run, receive path: ' + workflowRun.path,
  );
}

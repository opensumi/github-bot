import { Octokit } from '@octokit/rest';

import { StringBuilder } from '@/utils/string-builder';

import { Context, ExtractPayload } from '../types';

import { Template, StopHandleError, TemplateRenderResult } from './components';

function renderWorkflow(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): TemplateRenderResult {
  const action = payload.action as string;

  const builder = new StringBuilder();

  builder.add(`Name: {{workflow.name}}\n`);
  builder.add(`[Detail]({{workflow_run.html_url}})\n`);

  return Template(
    {
      payload,
      event: 'workflow',
      action,
      title: `{{sender | link}} run [workflow]({{workflow_run.html_url}}) {{workflow_run.conclusion}}`,
      body: builder.build(),
    },
    ctx,
  );
}

export async function handleWorkflowRun(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): Promise<TemplateRenderResult> {
  const workflow = payload.workflow;
  const workflowRun = payload.workflow_run;
  const repository = payload.repository;
  if (!workflowRun.path) {
    throw new StopHandleError('need workflow path');
  }

  if (!ctx.octokit) {
    throw new StopHandleError('should have ctx octokit');
  }

  const mapping = ctx.setting.workflowEventToNotify ?? {};
  const repoAllow = mapping[repository.full_name];

  if (repoAllow && repoAllow.includes(workflow.name)) {
    return renderWorkflow(payload, ctx);
  }

  throw new StopHandleError(
    'only selected path allow to run, receive path: ' + workflowRun.path,
  );
}

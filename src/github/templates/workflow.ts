import { StringBuilder } from '@/utils';
import { renderUserLink, titleTpl, textTpl, StopHandleError } from '.';
import { Context } from '../app';
import { ExtractPayload, MarkdownContent } from '../types';

export async function handleWorkflowRun(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context,
): Promise<MarkdownContent> {
  const workflow = payload.workflow;
  const workflowRun = payload.workflow_run;
  const action = payload.action as string;

  if (workflowRun.path !== '.github/workflows/manual-release-rc.yml') {
    throw new StopHandleError('only rc release');
  }

  const title = titleTpl(
    {
      repo: payload.repository,
      event: 'workflow',
      action,
    },
    ctx,
  );

  const builder = new StringBuilder();
  builder.add(`Name: ${workflow.name}, [Link](${workflow.html_url})`);

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

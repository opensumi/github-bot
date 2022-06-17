import { StringBuilder } from '@/utils';
import { renderUserLink, titleTpl, textTpl } from '.';
import { Context } from '../app';
import { ExtractPayload, MarkdownContent } from '../types';

export async function handleWorkflowRun(
  payload: ExtractPayload<'workflow_run'>,
  ctx: Context,
): Promise<MarkdownContent> {
  const workflow = payload.workflow;
  const action = payload.action as string;
  workflow.name;
  const title = titleTpl(
    {
      repo: payload.repository,
      event: 'workflow',
      action,
    },
    ctx,
  );

  const builder = new StringBuilder();
  builder.add(
    `Workflow ${workflow.name} 运行成功，状态：${workflow.state},[链接](${workflow.html_url})`,
  );

  const text = textTpl(
    {
      title: `[workflow](${workflow.html_url}) ${action} by ${renderUserLink(
        payload.sender,
      )}`,
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

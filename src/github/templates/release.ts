import { StringBuilder } from '@/utils/string-builder';

import { Context, ExtractPayload, TemplateRenderResult } from '../types';
import { replaceGitHubUrlToMarkdown } from '../utils';

import { textTpl } from '.';

export async function handleRelease(
  payload: ExtractPayload<'release'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const action = payload.action;
  const release = payload.release;

  const builder = new StringBuilder();

  let status = '';
  if (release.draft) {
    status = 'Draft';
  }
  if (release.prerelease) {
    status = 'Pre Release';
  }

  if (status) {
    builder.add(`Status: ${status}\n`);
  }

  builder.add(`Tag: ${release.tag_name}\n`);
  builder.add('{{release.body|ref}}');

  const text = textTpl(
    {
      payload,
      event: release.name,
      action,
      title: `{{ sender | link }} ${action} {{ release | link }}`,
      body: replaceGitHubUrlToMarkdown(builder.render(payload), {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
      }),
      notCapitalizeTitle: true,
    },
    ctx,
  );

  return text;
}

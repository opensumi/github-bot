import { StringBuilder } from '@/utils/string-builder';

import { Context, ExtractPayload, TemplateRenderResult } from '../types';
import { replaceGitHubUrlToMarkdown } from '../utils';

import { titleTpl } from './utils';

import { useRef, textTpl } from '.';

export async function handleRelease(
  payload: ExtractPayload<'release'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const action = payload.action;
  const release = payload.release;
  const title = titleTpl(
    {
      payload,
      event: release.name,
      action,
    },
    ctx,
    false,
  );

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
  builder.add(`>\n${useRef(release.body)}`);

  const text = textTpl(
    {
      payload,
      title: `{{ sender | link }} ${action} {{ release | link }}`,
      body: replaceGitHubUrlToMarkdown(builder.build(), {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
      }),
    },
    ctx,
  );

  return { title, ...text };
}

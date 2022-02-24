import { StringBuilder } from '@/utils';
import { renderUserLink, useRef, textTpl } from '.';
import { Context } from '../app';
import { ExtractPayload } from '../types';

export async function handleRelease(
  payload: ExtractPayload<'release'>,
  ctx: Context,
) {
  const action = payload.action;
  const release = payload.release;

  const title = `${release.name} ${action}`;

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
      repo: payload.repository,
      title: `${renderUserLink(payload.sender)} ${action} [${release.name}](${
        release.html_url
      })`,
      body: builder.build(),
    },
    ctx,
  );

  return { title, text };
}

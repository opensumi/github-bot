import { StringBuilder } from '@/utils';
import { renderRepoLink, renderUserLink, useRef } from '.';
import { ExtractPayload } from '../types';
import { titleTpl } from './trivias';

export async function handleRelease(payload: ExtractPayload<'release'>) {
  const action = payload.action;
  const release = payload.release;

  const title = titleTpl({
    repo: payload.repository,
    event: 'release',
    action,
  });

  const builder = new StringBuilder(
    `#### ${renderRepoLink(payload.repository)} [release@${release.name}](${
      release.html_url
    }) ${action} by ${renderUserLink(payload.sender)}`,
  );

  let status = '';
  if (release.draft) {
    status = 'draft';
  }
  if (release.prerelease) {
    status = 'pre release';
  }

  if (status) {
    builder.add(`Status: ${status}\n`);
  }

  builder.add(
    `Tag: ${release.tag_name}, Commitish: ${release.target_commitish}\n`,
  );
  builder.add(`>\n${useRef(release.body)}`);

  return { title, text: builder.build() };
}

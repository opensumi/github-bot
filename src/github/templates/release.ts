import { StringBuilder } from '@/utils';
import { renderRepoLink, renderUserLink, useRef, titleTpl } from '.';
import { Context } from '../app';
import { ExtractPayload } from '../types';

export async function handleRelease(
  payload: ExtractPayload<'release'>,
  ctx: Context,
) {
  const action = payload.action;
  const release = payload.release;

  const title = titleTpl({
    repo: payload.repository,
    event: 'release',
    action,
  });

  const builder = new StringBuilder(
    `#### ${renderRepoLink(payload.repository)} ${renderUserLink(
      payload.sender,
    )}  ${action} [${release.name}](${release.html_url})`,
  );

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
  let targetCommitish = release.target_commitish;
  if (targetCommitish.length === 40) {
    targetCommitish = targetCommitish.slice(0, 6);
  }

  builder.add(`Tag: ${release.tag_name}(${targetCommitish})\n`);
  builder.add(`>\n${useRef(release.body)}`);

  return { title, text: builder.build() };
}

import { renderRepoLink, renderUserLink, useRef } from '.';
import { ExtractPayload } from '../types';

export async function handleRelease(payload: ExtractPayload<'release'>) {
  const action = payload.action;
  const release = payload.release;

  const title = `[${payload.repository.name}] release ${release.name} ${action} by ${payload.sender.login}`;
  let text = `${renderRepoLink(payload.repository)} [release@${release.name}](${
    release.html_url
  }) ${action} by ${renderUserLink(payload.sender)}`;
  let status = '';
  if (release.draft) {
    status = 'draft';
  }
  if (release.prerelease) {
    status = 'pre release';
  }
  if (status) {
    text += `Status: ${status}\n`;
  }

  text += `Tag: ${release.tag_name}, Commitish: ${release.target_commitish}\n`;
  text += `>\n${useRef(release.body)}`;

  return { title, text };
}

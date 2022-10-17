import { CommandCenter } from '@/commander';
import { ExtractPayload } from '@/github/types';

import type { App } from '../app';

type IssueCommentHandler = (
  app: App,
  payload: ExtractPayload<'issue_comment'>,
) => Promise<void>;

export const issueCc = new CommandCenter<IssueCommentHandler>();

issueCc.on('hello', async (app, payload) => {
  const { issue, repository } = payload;
  await app.octoApp.octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: 'Hello there 👋',
    },
  );
});

import { CommandCenter } from '@/commander';

import { GitHubCommandCenter } from './types';

export * from './types';

export const issueCc = new CommandCenter(undefined, (it) => {
  it.on('hello', async (app, payload) => {
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
}) as GitHubCommandCenter;

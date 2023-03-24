import { CommandCenter } from '@/commander';

import { registerPullRequestCommand } from './pullRequests';
import { GitHubCommandCenter } from './types';

export * from './types';

export const issueCc = new CommandCenter(['/'], (it) => {
  it.on('hello', async (app, ctx, payload) => {
    await app.replyComment(payload, 'Hello there 👋');
  });
}) as GitHubCommandCenter;

registerPullRequestCommand(issueCc);

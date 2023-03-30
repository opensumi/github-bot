import { CommandCenter } from '@/commander';

import { registerPullRequestCommand } from './pullRequests';
import { GitHubCommandCenter } from './types';

export * from './types';

export const issueCc = new CommandCenter({
  prefix: ['/'],
}) as GitHubCommandCenter;

issueCc.on('hello', async (ctx) => {
  const { app, payload } = ctx;
  await app.replyComment(payload, 'Hello there 👋');
});

issueCc.setReplyTextHandler((ctx) => {
  const { app, payload } = ctx;

  return async (text: string) => {
    await app.replyComment(payload, text);
  };
});

registerPullRequestCommand(issueCc);

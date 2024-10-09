import { CommandCenter } from '@opensumi/bot-commander';

import { registerPullRequestCommand } from './pullRequests';
import { GitHubCommandCenter } from './types';

export * from './types';

export const issueCc = new CommandCenter({
  prefix: ['/'],
  replyText(ctx) {
    const { app } = ctx;

    return async (text: string) => {
      await app.replyComment(ctx, text);
    };
  },
}) as GitHubCommandCenter;

registerPullRequestCommand(issueCc);

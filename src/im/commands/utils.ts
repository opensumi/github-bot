import { StopErrorWithReply } from '@opensumi/bot-commander';

import { IBotAdapter } from '../types';

import { Context } from './types';

export function hasApp<T>(
  item: Context<T>,
): item is Context<T> & Required<Pick<Context<T>, 'app'>> {
  return !!item.app;
}

export async function replyIfAppNotDefined(bot: IBotAdapter, ctx: Context) {
  if (!hasApp(ctx)) {
    throw new StopErrorWithReply(
      'current bot has not configured use GitHub App. Please contact admin.',
    );
  }
}

export async function getGitHubUserFromDingtalkId(bot: IBotAdapter) {
  const dingtalkId = bot.msg.senderId;
  const githubId = await bot.userInfoKVManager.getGitHubUserByDingtalkId(
    dingtalkId,
  );
  if (!githubId) {
    throw new StopErrorWithReply(
      'it seem that you have not bind GitHub account, use `bind-github username` command to bind your GitHub account. e.g. `bind-github bytemain',
    );
  }

  return githubId;
}

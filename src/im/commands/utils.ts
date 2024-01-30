import { StopError } from '@opensumi/bot-commander';

import { IBotAdapter } from '../types';

import { Context } from './types';

export function hasApp<T>(
  item: Context<T>,
): item is Context<T> & Required<Pick<Context<T>, 'app'>> {
  return !!item.app;
}

export async function replyIfAppNotDefined(bot: IBotAdapter, ctx: Context) {
  if (!hasApp(ctx)) {
    await bot.replyText(
      'current bot has not configured use GitHub App. Please contact admin.',
    );
    throw new StopError('current bot has not configured use GitHub App');
  }
}

export async function getGitHubUserFromDingtalkId(bot: IBotAdapter) {
  const dingtalkId = bot.msg.senderId;
  const githubId = await bot.userInfoKVManager.getGitHubUserByDingtalkId(
    dingtalkId,
  );
  if (!githubId) {
    await bot.replyText(
      'it seem that you have not bind GitHub account, use `bind-github username` command to bind your GitHub account. e.g. `bind-github bytemain`',
    );
    throw new StopError(
      'it seem that you have not bind GitHub account, use `bind-github username` command to bind your GitHub account. e.g. `bind-github bytemain',
    );
  }

  return githubId;
}

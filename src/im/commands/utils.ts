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
  }
}

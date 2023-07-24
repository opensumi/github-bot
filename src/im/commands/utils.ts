import { DingBot } from '../bot';

import { Context } from './types';

export function hasApp<T>(
  item: Context<T>,
): item is Context<T> & Required<Pick<Context<T>, 'app'>> {
  return !!item.app;
}

export async function replyIfAppNotDefined(bot: DingBot, ctx: Context) {
  if (!hasApp(ctx)) {
    await bot.replyText(
      'Current DingBot has not configured use GitHub App. Please contact admin.',
    );
  }
}

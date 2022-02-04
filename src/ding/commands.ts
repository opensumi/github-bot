import { CommandCenter } from '@/command';
import { atDingtalkIds } from './message';
import type { DingBot } from './bot';

export type Handler = (bot: DingBot) => Promise<void>;

export const cc = new CommandCenter<Handler>(['']);

cc.on('*', async (bot) => {
  const { msg } = bot;
  await bot.replyText(
    `@${msg.senderId} 我是 Sumi~`,
    atDingtalkIds(msg.senderId),
  );
});

import { atDingtalkIds } from '../message';
import { cc } from './base';

cc.on('*', async (bot) => {
  const { msg } = bot;
  await bot.replyText(
    `@${msg.senderId} 我是 Sumi~`,
    atDingtalkIds(msg.senderId),
  );
});

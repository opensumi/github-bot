import { cc, Context } from './base';
import { code } from '../message';
import { DingInfo, updateGroupInfo } from '../secrets';
import { startsWith } from '@/command';

cc.on(
  'putData',
  async (bot, ctx: Context<Partial<DingInfo>>) => {
    const info = {} as DingInfo;
    if (ctx.parsed['defaultRepo']) {
      info['defaultRepo'] = ctx.parsed['defaultRepo'];
    }
    await updateGroupInfo(bot.id, info);
    await bot.replyText('更新信息成功');
  },
  undefined,
  startsWith,
);

cc.on('getGroupInfo', async (bot) => {
  await bot.reply(
    code(
      'json',
      JSON.stringify({
        conversationId: bot.msg.conversationId,
        senderCorpId: bot.msg.senderCorpId,
      }),
    ),
  );
});

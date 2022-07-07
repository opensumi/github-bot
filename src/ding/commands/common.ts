import { cc, Context } from './base';
import { code } from '../message';
import { DingInfo, updateGroupInfo } from '../secrets';
import { startsWith } from '@/command';
import { StringBuilder } from '@/utils';

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

cc.on('help', async (bot) => {
  const text = new StringBuilder();
  const prefix = cc.prefixs.filter(Boolean).join('、');
  if (prefix) {
    text.add('前缀：' + prefix);
  }

  text.add('支持的命令：', true);

  cc.reg.handlers.forEach(([key, func]) => {
    text.add(`- ${key}: ${func.name}`);
  });

  cc.regexReg.handlers.forEach(([key, func]) => {
    text.add(`- ${key}: ${func.name}`);
  });
  if (cc.fallbackHandler) {
    text.add(`- *: fallbackHandler`);
  }

  await bot.replyText(text.build());
});

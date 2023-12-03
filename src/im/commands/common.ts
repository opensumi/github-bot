import { IDingInfo } from '@/kv/types';
import { StringBuilder } from '@/utils/string-builder';
import { startsWith } from '@opensumi/bot-commander';
import { code } from '@opensumi/dingtalk-bot/lib/types';

import { IMCommandCenter } from './types';

export function registerCommonCommand(it: IMCommandCenter) {
  it.on(
    'putData',
    async ({ bot, ctx }) => {
      const info = {} as IDingInfo;
      if (ctx.parsed.raw['defaultRepo']) {
        info['defaultRepo'] = ctx.parsed.raw['defaultRepo'];
      }
      await bot.kvManager.updateGroupInfo(bot.id, info);
      await bot.replyText('更新信息成功');
    },
    undefined,
    startsWith,
  );

  it.on('getGroupInfo', async ({ bot, ctx }) => {
    await bot.reply(
      code(
        'json',
        JSON.stringify({
          conversationId: ctx.message.conversationId,
          senderCorpId: ctx.message.senderCorpId,
        }),
      ),
    );
  });

  it.on('help', async ({ bot }) => {
    const text = new StringBuilder();
    const prefix = it.prefixes.filter(Boolean).join('、');
    if (prefix) {
      text.add('前缀：' + prefix);
    }

    text.add('支持的命令：', true);

    it.registry.handlers.forEach(([key, [_, compareFunc]]) => {
      text.add(`- ${key}: ${compareFunc.name}`);
    });

    it.regexRegistry.handlers.forEach(([key, [_, compareFunc]]) => {
      text.add(`- ${key}: ${compareFunc.name}`);
    });
    if (it.fallbackHandler) {
      text.add(`- *: fallbackHandler`);
    }

    await bot.replyText(text.build());
  });

  it.on('ping', async ({ bot }) => {
    await bot.replyText('pong');
  });
}

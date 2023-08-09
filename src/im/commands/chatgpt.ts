import { OpenAI } from '@/im/openai';

import { IMCommandCenter } from './types';

export function registerChatGPTCommand(it: IMCommandCenter) {
  it.on('清除记忆', async ({ bot }) => {
    await bot.conversationKVManager.clearConversation();
    await bot.replyText('已清除记忆');
  });

  it.on('setWaitTime', async ({ bot, ctx }) => {
    const num = Number(ctx.parsed._[1]);
    if (typeof num === 'number' || !isNaN(num)) {
      await bot.conversationKVManager.setThrottleWait(num);
    }
    await bot.replyText('轮询通报时间已经设置为 ' + num + '秒');
  });

  it.all(async ({ bot, ctx, text }) => {
    try {
      const openai = new OpenAI(text, bot, ctx);
      const t = await openai.getReplyText();
      if (t) {
        await openai.reply(t);
      } else {
        await bot.replyText('OpenAI 接口调用没有返回结果');
      }
    } catch (error) {
      await bot.replyText(
        'OpenAI 接口返回错误信息：' + (error as Error).message,
      );
    }
  });
}

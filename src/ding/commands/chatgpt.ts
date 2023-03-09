import { ECompletionModel } from '@/ai/openai/shared';
import { OpenAI } from '@/ding/openai';

import type { DingBot } from '../bot';
import { IDingInfo } from '../secrets';

import { Context, DingCommandCenter } from './types';

export function registerChatGPTCommand(it: DingCommandCenter) {
  it.on('清除记忆', async (bot: DingBot) => {
    await bot.conversationKVManager.clearConversation();
    await bot.replyText('已清除记忆');
  });
  it.on('使用ChatGPT', async (bot: DingBot) => {
    await bot.conversationKVManager.setPreferredConversationModel(
      ECompletionModel.ChatGPT,
    );
    await bot.replyText('模型已经切换为 ChatGPT');
  });
  it.on('使用GPT3', async (bot: DingBot) => {
    await bot.conversationKVManager.setPreferredConversationModel(
      ECompletionModel.GPT3,
    );
    await bot.replyText('模型已经切换为 GPT3');
  });

  it.on(
    'setWaitTime',
    async (bot: DingBot, ctx: Context<Partial<IDingInfo>>) => {
      const num = Number(ctx.parsed._[1]);
      if (typeof num === 'number' || !isNaN(num)) {
        await bot.conversationKVManager.setThrottleWait(num);
      }
      await bot.replyText('轮训通报时间已经设置为 ' + num + '秒');
    },
  );

  it.all(async (bot: DingBot, ctx: Context) => {
    try {
      const openai = new OpenAI(bot, ctx);
      const text = await openai.getReplyText();
      if (text) {
        await openai.reply(text);
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

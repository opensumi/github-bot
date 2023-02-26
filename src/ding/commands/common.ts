import pTimeout, { TimeoutError } from 'p-timeout';

import { OpenAI } from '@/ai/openai';
import { ECompletionModel } from '@/ai/openai/shared';
import { startsWith } from '@/commander';
import { StringBuilder } from '@/utils';

import type { DingBot } from '../bot';
import { code } from '../message';
import { IDingInfo } from '../secrets';

import { Context, DingCommandCenter } from './types';

export function registerCommonCommand(it: DingCommandCenter) {
  it.on(
    'putData',
    async (bot: DingBot, ctx: Context<Partial<IDingInfo>>) => {
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

  it.on('getGroupInfo', async (bot: DingBot) => {
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

  it.on('help', async (bot: DingBot) => {
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

  it.on('ping', async (bot: DingBot) => {
    await bot.replyText('pong');
  });

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
  it.all(async (bot: DingBot, ctx: Context) => {
    try {
      const openai = new OpenAI(bot, ctx);
      const text = await pTimeout(openai.getReplyText(), {
        milliseconds: 61 * 1000,
        message: 'openai-timeout',
      });
      if (text) {
        await openai.reply(text);
      } else {
        await bot.replyText('OpenAI 接口调用没有返回结果');
      }
    } catch (error) {
      console.log(`🚀 ~ file: common.ts:97 ~ it.all ~ error:`, error);
      if (error instanceof TimeoutError) {
        await bot.replyText('OpenAI 接口调用超时(60s)');
        return;
      }
      await bot.replyText(
        'OpenAI 接口返回错误信息：' + (error as Error).message,
      );
    }
  });
}

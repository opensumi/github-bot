// import { Configuration, OpenAIApi } from 'openai';

import { startsWith } from '@/commander';
import { StringBuilder } from '@/utils';

import type { DingBot } from '../bot';
import { code } from '../message';
import { IDingInfo } from '../secrets';

import { cc, Context } from './base';

cc.on(
  'putData',
  async (bot: DingBot, ctx: Context<Partial<IDingInfo>>) => {
    const info = {} as IDingInfo;
    if (ctx.parsed['defaultRepo']) {
      info['defaultRepo'] = ctx.parsed['defaultRepo'];
    }
    await bot.kvManager.updateGroupInfo(bot.id, info);
    await bot.replyText('更新信息成功');
  },
  undefined,
  startsWith,
);

cc.on('getGroupInfo', async (bot: DingBot) => {
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

cc.on('help', async (bot: DingBot) => {
  const text = new StringBuilder();
  const prefix = cc.prefixes.filter(Boolean).join('、');
  if (prefix) {
    text.add('前缀：' + prefix);
  }

  text.add('支持的命令：', true);

  cc.registry.handlers.forEach(([key, [_, compareFunc]]) => {
    text.add(`- ${key}: ${compareFunc.name}`);
  });

  cc.regexRegistry.handlers.forEach(([key, [_, compareFunc]]) => {
    text.add(`- ${key}: ${compareFunc.name}`);
  });
  if (cc.fallbackHandler) {
    text.add(`- *: fallbackHandler`);
  }

  await bot.replyText(text.build());
});

cc.on('ping', async (bot: DingBot) => {
  await bot.replyText('pong');
});

// cc.on('*', async (bot: DingBot, ctx: Context) => {
//   if (bot.env.OPENAI_API_KEY) {
//     const configuration = new Configuration({
//       apiKey: bot.env.OPENAI_API_KEY,
//     });
//     const openai = new OpenAIApi(configuration);
//     const response = await openai.createCompletion({
//       model: 'text-davinci-003',
//       prompt: ctx.command,
//       temperature: 0.7, //A number between 0 and 1 that determines how many creative risks the engine takes when generating text.
//       max_tokens: 3000, // Maximum completion length. max: 4000-prompt
//       frequency_penalty: 0.7, // # between 0 and 1. The higher this value, the bigger the effort the model will make in not repeating itself.
//     });
//     const text = response.data.choices[0].text;
//     if (text) {
//       await bot.replyText(text);
//     }
//   }
// });

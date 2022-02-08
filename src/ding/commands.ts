import { CommandCenter } from '@/command';
import { atDingtalkIds, markdown } from './message';
import type { DingBot } from './bot';
import { Message } from './types';
import mri from 'mri';
import { App } from '@/lib/octo';

interface Context {
  message: Message;
  command: string;
  parsed: mri.Argv;
  app: App;
}

export type Handler = (bot: DingBot, ctx: Context) => Promise<void>;

export const cc = new CommandCenter<Handler>(['']);

cc.on('*', async (bot) => {
  const { msg } = bot;
  await bot.replyText(
    `@${msg.senderId} 我是 Sumi~`,
    atDingtalkIds(msg.senderId),
  );
});

cc.on(
  'star',
  async (bot, ctx) => {
    const { app } = ctx;

    const posArg = ctx.parsed['_'];
    let owner = 'opensumi';
    let repo = 'core';
    if (posArg.length === 2) {
      const tmp = posArg[1];
      if (tmp.includes('/')) {
        owner = tmp.split('/')[0];
        repo = tmp.split('/')[1];
      } else {
        repo = tmp;
      }
    } else if (posArg.length === 3) {
      owner = posArg[1];
      repo = posArg[2];
    }

    const payload = await app.api.getRepoStarRecords(owner, repo);
    const content = markdown(
      'Stars',
      `
\`\`\`ts
${JSON.stringify(payload)}
\`\`\`
    `,
    );
    await bot.reply(content);
  },
  ['stars'],
  'startwiths',
);

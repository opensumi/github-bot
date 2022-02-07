import { CommandCenter } from '@/command';
import { atDingtalkIds, markdown } from './message';
import type { DingBot } from './bot';
import { app } from '@/github/app';
import mri from 'mri';
import { Message } from './types';

interface Context {
  message: Message;
  command: string;
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

function parseCliArgs(command: string) {
  return mri(command.split(' '));
}

cc.on(
  'star',
  async (bot, ctx) => {
    const { command } = ctx;
    console.log(command.split(' '));

    const result = parseCliArgs(command);
    console.log(`🚀 ~ file: commands.ts ~ line 34 ~ result`, result);
    const posArg = result['_'];
    console.log(`🚀 ~ file: commands.ts ~ line 35 ~ posArg`, posArg);
    let owner = 'opensumi';
    let repo = 'core';
    if (posArg.length === 2) {
      const tmp = posArg[1];
      if (tmp.includes('/')) {
        owner = tmp.split('/')[0];
        repo = tmp.split('/')[1];
      }
    } else if (posArg.length === 3) {
      owner = posArg[1];
      repo = posArg[2];
    }

    const payload = await app().api.getRepoStarRecords(owner, repo);
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

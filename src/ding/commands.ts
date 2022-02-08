import { CommandCenter } from '@/command';
import { atDingtalkIds, image, markdown } from './message';
import type { DingBot } from './bot';
import { Message } from './types';
import mri from 'mri';
import { IApp } from '@/github/app';
interface Context {
  message: Message;
  command: string;
  parsed: mri.Argv;
  app: IApp;
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

function getUrl(str: string) {
  try {
    const url = new URL(str);
    return url;
  } catch (_) {
    return;
  }
}

function makeid(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

console.log(makeid(5));

cc.on(
  'http',
  async (bot, ctx) => {
    const { command, app } = ctx;
    const octokit = await app.getInstallationOcto();
    const url = getUrl(command);
    if (!url) {
      return;
    }
    if (url.hostname !== 'github.com') {
      return;
    }

    const pathname = url.pathname.slice(1);
    const splitted = pathname.split('/');
    if (splitted.length === 1) {
      console.log('is user or org');
    } else if (splitted.length === 2) {
      console.log('is repo');
      const result = await octokit.repos.get({
        owner: splitted[0],
        repo: splitted[1],
      });
      const name = result.data?.full_name;
      if (name) {
        await bot.reply(
          image(`https://opengraph.githubassets.com/${makeid(16)}/${name}`),
        );
      }
      return;
    } else {
      console.log('sub');
    }
  },
  [],
  'startwiths',
);

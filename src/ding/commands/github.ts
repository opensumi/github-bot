import { startsWith } from '@/command';
import { cc, Context } from './base';
import { code, image } from '../message';

// cmds example:
// 1. star -> opensumi/core
// 2. star ide-startup -> opensumi/ide-startup
// 3. star microsoft/core -> microsoft/core
// 4. star microsoft core -> microsoft/core
function getRepoInfoFromCommand(cmds: string[]) {
  let owner = 'opensumi';
  let repo = 'core';
  if (cmds.length === 2) {
    const tmp = cmds[1];
    if (tmp.includes('/')) {
      owner = tmp.split('/')[0];
      repo = tmp.split('/')[1];
    } else {
      repo = tmp;
    }
  } else if (cmds.length === 3) {
    owner = cmds[1];
    repo = cmds[2];
  }

  return {
    owner,
    repo,
  };
}

cc.on(
  'star',
  async (bot, ctx) => {
    const { app } = ctx;

    const posArg = ctx.parsed['_'];
    const { owner, repo } = getRepoInfoFromCommand(posArg);
    const payload = await app.api.getRepoStarRecords(owner, repo);
    const content = code('json', JSON.stringify(payload));
    await bot.reply(content);
  },
  ['stars'],
  startsWith,
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
  startsWith,
);

const ISSUE_REGEX = /^#(?<number>\d+)$/;
const REPO_REGEX =
  /^(?<owner>[a-zA-Z0-9][a-zA-Z0-9\-]*)\/(?<repo>[a-zA-Z0-9_\-.]+)$/;

cc.onRegex(ISSUE_REGEX, async (bot, ctx) => {
  const { app } = ctx;
  await bot.replyText(`请你自己打开 GitHub。`);
});

cc.onRegex(REPO_REGEX, async (bot, ctx) => {
  const { app } = ctx;
  await bot.replyText(`请你自己打开 GitHub。`);
});

cc.on(
  'history',
  async (bot, ctx) => {
    const { app } = ctx;

    const posArg = ctx.parsed['_'];
    const { owner, repo } = getRepoInfoFromCommand(posArg);
    const payload = await app.api.getRepoHistory(owner, repo);
    console.log(`🚀 ~ file: github.ts ~ line 127 ~ payload`, payload);
    const content = code('json', JSON.stringify(payload, null, 2));
    console.log(`🚀 ~ file: github.ts ~ line 128 ~ content`, content);
    await bot.reply(content);
    await bot.replyText('已经发给你啦');
  },
  [],
  startsWith,
);

cc.on(
  'rc',
  async (bot, ctx: Context<{ ref: string }>) => {
    const { app } = ctx;

    const ref = ctx.parsed.ref;
    const payload = await app.api.releaseRCVersion(ref);
    const content = code('json', JSON.stringify(payload));
    await bot.replyText(`在该 REF(${ref}) 上发布 RC 成功`);
    await bot.reply(content);
  },
  ['stars'],
  startsWith,
);

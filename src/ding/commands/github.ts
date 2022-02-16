import { startsWith } from '@/command';
import { cc } from './base';
import { image, markdown } from '../message';

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

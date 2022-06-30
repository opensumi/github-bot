import { startsWith } from '@/command';
import { cc, Context } from './base';
import { code, image } from '../message';
import { getDefaultRepo } from '../secrets';
import { DingBot } from '../bot';

// example:
// 1. star -> opensumi/core
// 2. star ide-startup -> opensumi/ide-startup
// 3. star microsoft/core -> microsoft/core
// 4. star microsoft core -> microsoft/core
async function getRepoInfoFromCommand(argv: string[], bot: DingBot) {
  const defaultRepo = await getDefaultRepo(bot.id);
  let owner, repo;
  if (defaultRepo) {
    owner = defaultRepo.owner;
    repo = defaultRepo.repo;
  }

  if (argv.length === 2) {
    const tmp = argv[1];
    if (tmp.includes('/')) {
      owner = tmp.split('/')[0];
      repo = tmp.split('/')[1];
    } else {
      repo = tmp;
    }
  } else if (argv.length === 3) {
    owner = argv[1];
    repo = argv[2];
  }
  if (!owner || !repo) {
    await bot.replyText(
      'pls set defaultRepo first. e.g. `putData --defaultRepo opensumi/core`',
    );
    throw new Error('pls set defaultRepo first');
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
    const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
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
    const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
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
    if (ref) {
      const payload = await app.api.releaseRCVersion(ref);
      if (payload.status === 204) {
        await bot.replyText(`在 ${ref} 上发布 Release Candidate 成功`);
      } else {
        await bot.replyText(`调用流水线时发生错误：${JSON.stringify(payload)}`);
      }
    } else {
      await bot.replyText(`使用方法 rc --ref v2.xx`);
    }
  },
  [],
  startsWith,
);

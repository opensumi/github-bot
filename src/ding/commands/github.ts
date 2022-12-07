import { startsWith } from '@/commander';
import { render } from '@/github/render';
import { contentToMarkdown } from '@/github/utils';
import { proxyThisUrl } from '@/utils';

import type { DingBot } from '../bot';
import { code, markdown } from '../message';

import { cc, Context, RegexContext } from './base';
import { hasApp, replyIfAppNotDefined } from './utils';

async function getDefaultRepo(bot: DingBot) {
  const defaultRepo = await bot.kvManager.getDefaultRepo(bot.id);
  if (!defaultRepo) {
    await bot.replyText(
      'pls set defaultRepo first. e.g. `putData --defaultRepo opensumi/core`',
    );
    throw new Error('pls set defaultRepo first');
  }
  return defaultRepo;
}

// example:
// 1. star -> opensumi/core
// 2. star ide-startup -> opensumi/ide-startup
// 3. star microsoft/core -> microsoft/core
// 4. star microsoft core -> microsoft/core
async function getRepoInfoFromCommand(argv: string[], bot: DingBot) {
  const defaultRepo = await bot.kvManager.getDefaultRepo(bot.id);
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
  async (bot: DingBot, ctx: Context) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    const posArg = ctx.parsed['_'];
    const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
    const payload = await app.octoService.getRepoStarRecords(owner, repo);
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
  async (bot: DingBot, ctx: Context) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { command, app } = ctx;
    const octokit = await app.getOcto();
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
      const full_name = result.data?.full_name;
      if (full_name) {
        await bot.reply(
          markdown(
            `${full_name} Open Graph`,
            `![](${proxyThisUrl(
              bot.env,
              `https://opengraph.githubassets.com/${makeid(16)}/${full_name}`,
            )})`,
          ),
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

cc.onRegex(REPO_REGEX, async (bot: DingBot, ctx: RegexContext) => {
  await replyIfAppNotDefined(bot, ctx);
  if (!hasApp(ctx)) {
    return;
  }

  const { app, result } = ctx;
  const regexResult = result.result;
  const owner = regexResult.groups!['owner'];
  const repo = regexResult.groups!['repo'];

  const octokit = await app.getOcto();
  const repoData = await octokit.repos.get({
    owner,
    repo,
  });
  const full_name = repoData.data?.full_name;
  if (full_name) {
    await bot.reply(
      markdown(
        `${full_name} Open Graph`,
        `![](${proxyThisUrl(
          bot.env,
          `https://opengraph.githubassets.com/${makeid(16)}/${full_name}`,
        )})`,
      ),
    );
  }
});

cc.onRegex(ISSUE_REGEX, async (bot: DingBot, ctx: RegexContext) => {
  await replyIfAppNotDefined(bot, ctx);
  if (!hasApp(ctx)) {
    return;
  }

  const { app, result } = ctx;
  const regexResult = result.result;
  const issueNumber = Number(regexResult.groups!['number']);
  const defaultRepo = await getDefaultRepo(bot);

  const issue = await app.octoService.getIssuePrByNumber(
    defaultRepo.owner,
    defaultRepo.repo,
    issueNumber,
  );
  if (issue) {
    const markdown = render(issue);
    await bot.reply(contentToMarkdown(markdown));
  } else {
    await bot.replyText(
      `${issueNumber} 不是 ${defaultRepo.owner}/${defaultRepo.repo} 仓库有效的 issue number`,
    );
  }
});

cc.on(
  'history',
  async (bot: DingBot, ctx: Context) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    const posArg = ctx.parsed['_'];
    const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
    const payload = await app.octoService.getRepoHistory(owner, repo);
    console.log(`🚀 ~ file: github.ts ~ line 127 ~ payload`, payload);
    const content = code('json', JSON.stringify(payload, null, 2));
    console.log(`🚀 ~ file: github.ts ~ line 128 ~ content`, content);
    await bot.reply(content);
    await bot.replyText('已经发给你啦');
  },
  [],
  startsWith,
);

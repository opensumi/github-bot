import { startsWith } from '@/commander';
import { App } from '@/github/app';
import { render } from '@/github/render';
import { contentToMarkdown, parseGitHubUrl } from '@/github/utils';

import { code, markdown } from '../message';
import { IBotAdapter } from '../types';

import { ISSUE_REGEX, REPO_REGEX } from './constants';
import { IMCommandCenter } from './types';
import { hasApp, replyIfAppNotDefined } from './utils';

export function registerGitHubCommand(it: IMCommandCenter) {
  it.on(REPO_REGEX, async ({ bot, ctx, result }) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;
    const regexResult = result.result;
    const owner = regexResult.groups!['owner'];
    const repo = regexResult.groups!['repo'];

    const repoData = await app.octoApp.octokit.repos.get({
      owner,
      repo,
    });
    const full_name = repoData.data?.full_name;
    if (full_name) {
      await bot.reply(
        markdown(
          `${full_name} Open Graph`,
          `![](${bot.getProxiedUrl(
            `https://opengraph.githubassets.com/${makeid(16)}/${full_name}`,
          )})`,
        ),
      );
    }
  });

  it.on(ISSUE_REGEX, async ({ bot, ctx, result }) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;
    const regexResult = result.result;
    const issueNumber = Number(regexResult.groups!['number']);
    const defaultRepo = await getDefaultRepo(bot);

    await replyGitHubIssue(
      bot,
      app,
      defaultRepo.owner,
      defaultRepo.repo,
      issueNumber,
    );
  });

  it.on(
    'history',
    async ({ bot, ctx }) => {
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

  it.on(
    'http',
    async ({ bot, ctx, text }) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      const githubUrl = parseGitHubUrl(text);
      if (githubUrl) {
        if (githubUrl.type === 'repo') {
          const result = await app.octoApp.octokit.repos.get({
            owner: githubUrl.owner,
            repo: githubUrl.repo,
          });
          const full_name = result.data?.full_name;
          if (full_name) {
            await bot.reply(
              markdown(
                `${full_name} Open Graph`,
                `![](${bot.getProxiedUrl(
                  `https://opengraph.githubassets.com/${makeid(
                    16,
                  )}/${full_name}`,
                )})`,
              ),
            );
          }
          return;
        } else if (githubUrl.type === 'issue') {
          return await replyGitHubIssue(
            bot,
            app,
            githubUrl.owner,
            githubUrl.repo,
            githubUrl.number,
          );
        }
      }
    },
    [],
    startsWith,
  );

  it.on(
    'star',
    async ({ bot, ctx }) => {
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
}

async function getDefaultRepo(bot: IBotAdapter) {
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
async function getRepoInfoFromCommand(argv: string[], bot: IBotAdapter) {
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

async function replyGitHubIssue(
  bot: IBotAdapter,
  app: App,
  owner: string,
  repo: string,
  issueNumber: number,
) {
  const issue = await app.octoService.getIssuePrByNumber(
    owner,
    repo,
    issueNumber,
  );
  if (issue) {
    const markdown = render(issue);
    await bot.reply(contentToMarkdown(markdown));
  } else {
    await bot.replyText(
      `${issueNumber} 不是 ${owner}/${repo} 仓库有效的 issue number`,
    );
  }
}

import { App } from '@/github/app';
import { convertToDingMarkdown } from '@/github/dingtalk';
import { parseGitHubUrl } from '@/github/gfm';
import { renderPrOrIssue } from '@/github/renderer';
import { StringBuilder } from '@/utils';
import { code } from '@opensumi/dingtalk-bot/lib/types';

import { IBotAdapter } from '../types';

import { ISSUE_REGEX, REPO_REGEX } from './constants';
import { IMCommandCenter } from './types';
import {
  getGitHubUserFromDingtalkId,
  hasApp,
  replyIfAppNotDefined,
} from './utils';

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
        convertToDingMarkdown(
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
    async ({ bot, ctx }, command) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;

      const posArg = command.argv;
      const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
      const payload = await app.octoService.getRepoHistory(owner, repo);
      console.log(`🚀 ~ file: github.ts ~ line 127 ~ payload`, payload);
      const content = code('json', JSON.stringify(payload, null, 2));
      console.log(`🚀 ~ file: github.ts ~ line 128 ~ content`, content);
      await bot.reply(content);
      await bot.replyText('已经发给你啦');
    },
    [],
  );

  it.on(
    'http',
    async ({ bot, ctx }, command) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      const githubUrl = parseGitHubUrl(command.raw);
      if (githubUrl) {
        if (githubUrl.type === 'repo') {
          const result = await app.octoApp.octokit.repos.get({
            owner: githubUrl.owner,
            repo: githubUrl.repo,
          });
          const full_name = result.data?.full_name;
          if (full_name) {
            await bot.reply(
              convertToDingMarkdown(
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
  );

  it.on(
    'star',
    async ({ bot, ctx }, command) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;

      const posArg = command.argv;
      const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
      const payload = await app.octoService.getRepoStarRecords(owner, repo);
      const content = code('json', JSON.stringify(payload));
      await bot.reply(content);
    },
    ['stars'],
  );

  it.on('bind-github', async ({ bot, ctx }, command) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const posArg = command.argv;

    if (!(posArg.length > 1)) {
      return;
    }

    const githubId = posArg[1];

    const senderId = ctx.message.senderId;

    await bot.userInfoKVManager.updateGitHubUserByDingtalkId(
      senderId,
      githubId,
    );

    await bot.replyText('success');
  });

  it.on(
    'my-pr',
    async ({ bot, ctx }, command) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      const githubUserId = await getGitHubUserFromDingtalkId(bot);
      const posArg = command.argv;
      const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
      const prs = await app.octoService.pr.getPullRequests(
        owner,
        repo,
        githubUserId,
      );

      const builder = new StringBuilder();

      builder.add(`# ${githubUserId}'s prs of ${owner}/${repo}`);
      builder.add(`${prs.length} open PRs`);
      builder.add('');
      for (const pr of prs) {
        builder.add(`- [${pr.title}](${pr.html_url})`);
      }

      await bot.reply(
        convertToDingMarkdown(
          `${githubUserId}'s prs of ${owner}/${repo}`,
          builder.toString(),
        ),
      );
    },
    ['mypr'],
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
    const data = renderPrOrIssue(issue);
    await bot.reply(convertToDingMarkdown(data.title, data.text));
  } else {
    await bot.replyText(
      `${issueNumber} 不是 ${owner}/${repo} 仓库有效的 issue number`,
    );
  }
}

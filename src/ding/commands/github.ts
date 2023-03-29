import { startsWith, equalFunc } from '@/commander';
import { App } from '@/github/app';
import { render } from '@/github/render';
import { IOrganizationNewContributionsResult } from '@/github/service/types';
import { contentToMarkdown, parseGitHubUrl } from '@/github/utils';
import { formatDate, proxyThisUrl } from '@/utils';

import type { DingBot } from '../bot';
import { code, markdown } from '../message';

import {
  ISSUE_REGEX,
  REPO_REGEX,
  TEAM_MEMBERS,
  TEAM_MEMBER_PR_REQUIREMENT,
} from './constants';
import { Context, DingCommandCenter, RegexContext } from './types';
import { hasApp, replyIfAppNotDefined } from './utils';

export function registerGitHubCommand(it: DingCommandCenter) {
  it.on(REPO_REGEX, async (bot: DingBot, ctx: RegexContext) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app, result } = ctx;
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
          `![](${proxyThisUrl(
            `https://opengraph.githubassets.com/${makeid(16)}/${full_name}`,
          )})`,
        ),
      );
    }
  });

  it.on(ISSUE_REGEX, async (bot: DingBot, ctx: RegexContext) => {
    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app, result } = ctx;
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

  it.on(
    'http',
    async (bot: DingBot, ctx: Context) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { command, app } = ctx;
      const githubUrl = parseGitHubUrl(command);
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
                `![](${proxyThisUrl(
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

  it.on(
    'report',
    async (bot: DingBot, ctx: Context) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      const now = new Date();
      // 获取一个月前的日期对象
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );

      const posArg = ctx.parsed['_'];
      const { owner, repo } = await getRepoInfoFromCommand(posArg, bot);
      const results = await app.octoService.getOrganizationPRCount(owner);
      const notUpToStandards = [];
      let content = '# Monthly Report of OpenSumi\n';
      content += `> This report counts OpenSumi organization data from ${formatDate(
        oneMonthAgo,
      )} to ${formatDate(now)}.\n\n`;
      content +=
        'The monthly report aims to provide an overview of the [OpenSumi](https://github.com/opensumi), it contains the basis of all projects within the [OpenSumi](https://github.com/opensumi) organization, as well as a summary of the most significant changes and improvements made during the month.\n';
      content += '## Overview\n';
      const contributors = await app.octoService.getContributors(owner, repo);
      const newContributors =
        await app.octoService.getOrganizationNewContributors(owner);
      const contributionIncrement = newContributors[`${owner}/${repo}`];

      const history = await app.octoService.getRepoHistory(
        owner,
        repo,
        oneMonthAgo.getTime(),
        now.getTime(),
      );

      content += '### Basic (opensumi/core)\n';
      content +=
        'This content will show how the star, watch, fork and contributors count changed in the passed month.\n';

      content += '| Star | Watch | Fork | Contributors |\n';
      content += '| ---- | ----- | ---- | ------------ |\n';
      content += `| ${history.star_count}(↑${
        history.star_increment
      }) | - | - | ${contributors.length}${
        contributionIncrement ? `(↑${contributionIncrement.length})` : ''
      } |\n`;

      content += '### Issues & PRS (opensumi/core)\n';
      content +=
        'Issues & PRs show the new/closed issues/pull requests count in the passed month.\n';

      content += '| New Issues | Closed Issues | New PR | Merged PR |\n';
      content += '| ---------- | ------------- | ------ | --------- |\n';
      content += `| ${history.issue_increment} | ${history.issue_closed_increment} | ${history.pull_increment} | ${history.pull_closed_increment} |\n`;
      content += '\n';
      content += '## Contributors\n';
      content +=
        'This section will show the contribution of each developer in the OpenSumi organization in the passed month.\n';

      content += '| Contributor ID | Role | Working On | PRs Count |\n';
      content += '| -------------- | ---- | ---------- | --------- |\n';

      for (const login of Object.keys(results)) {
        const role = await app.octoService.getMemberRole(owner, login);
        content += `| [@${login}](https://github.com/${login}) | ${role.toUpperCase()} | ${results[
          login
        ].details.join(',')} | ${results[login].total} |\n`;

        if (
          role === TEAM_MEMBERS.MENTOR &&
          results[login].total < TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.MENTOR]
        ) {
          notUpToStandards.push({
            login,
            role,
            total: results[login].total,
            requirement: TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.MENTOR],
          });
        } else if (
          role === TEAM_MEMBERS.CORE_MEMBER &&
          results[login].total <
            TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.CORE_MEMBER]
        ) {
          notUpToStandards.push({
            login,
            role,
            total: results[login].total,
            requirement: TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.CORE_MEMBER],
          });
        } else if (
          role === TEAM_MEMBERS.CONTRIBUTOR &&
          results[login].total <
            TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.CONTRIBUTOR]
        ) {
          notUpToStandards.push({
            login,
            role,
            total: results[login].total,
            requirement: TEAM_MEMBER_PR_REQUIREMENT[TEAM_MEMBERS.CONTRIBUTOR],
          });
        }
      }
      content += '\n';
      content += '## TeamMember requrement\n';
      content +=
        'We require each team member to have corresponding contribution requirements while enjoying permissions.\n';
      content += '| Team Role | Requirement (PRs) |\n';
      content += '| --------- | ----------------- |\n';
      content += '| Mentor | 10 |\n';
      content += '| Core Member | 5 |\n';
      content += '| Contributor | 3 |\n';
      content += '\n';
      content += 'Some team members did not meet the standard this month.\n';

      content += '| Contributor ID | Team Role | Count | Requirement (PRs) |\n';
      content +=
        '| -------------- | --------- | --------- | ----------------- |\n';
      content += notUpToStandards
        .map(
          (standard) =>
            `| ${standard.login} | ${standard.role.toUpperCase()} | ${
              standard.total
            } | **${standard.requirement}** |`,
        )
        .join('\n');
      content += '\n';

      content += '## New Contributors\n';
      content += `It is OpenSumi team's great honor to have new contributors from community. We really appreciate your contributions. Feel free to tell us if you have any opinion and please share this open source project with more people if you could. If you hope to be a contributor as well, please start from [如何贡献代码](https://opensumi.com/zh/docs/develop/how-to-contribute) or [How To Contribute](https://opensumi.com/en/docs/develop/how-to-contribute).\n\n`;
      content += `Here is the list of new contributors:\n\n`;

      for (const repo of Object.keys(newContributors)) {
        if (newContributors[repo].length) {
          content += `**${repo}:**\n\n`;
          content += newContributors[repo]
            .map(
              (contributor: IOrganizationNewContributionsResult) =>
                `@${contributor.login}`,
            )
            .join('\n');
          content += '\n\n';
        }
      }
      content += '\n';
      content += 'Thanks goes to these wonderful people!';

      const title = `[Monthly Report] Monthly Report of OpenSumi from ${formatDate(
        oneMonthAgo,
      )} to ${formatDate(now)}`;

      await app.octoService.octo.issues.create({
        owner: 'opensumi',
        repo: 'reports',
        title,
        body: content,
        labels: ['monthly-report'],
      });
    },
    [],
    equalFunc,
  );
}

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
  bot: DingBot,
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

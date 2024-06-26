import { ActionsRepo, getActionsUrl } from '@/constants/opensumi';
import { convertToDingMarkdown } from '@/github/dingtalk';
import {
  ICommand,
  StopError,
  StopErrorWithReply,
} from '@opensumi/bot-commander';

import { IBotAdapter } from '../types';

import { KnownRepo } from './constants';
import { Context, IMCommandCenter, IMCommandCenterContext } from './types';
import { hasApp, replyIfAppNotDefined } from './utils';

/**
 * 拦截本次请求
 */
async function repoIntercept(bot: IBotAdapter, ctx: Context, repo: string) {
  const defaultRepo = await bot.kvManager.getDefaultRepo(bot.id);
  if (!defaultRepo) {
    return true;
  }
  if (repo !== `${defaultRepo.owner}/${defaultRepo.repo}`) {
    return true;
  }

  return false;
}

export function registerOpenSumiCommand(it: IMCommandCenter) {
  const intercept = async (bot: IBotAdapter, ctx: Context) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      throw new StopError('command only works in opensumi repo');
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      throw new StopErrorWithReply(
        'current bot has not configured use GitHub App',
      );
    }

    return hasApp(ctx);
  };

  it.on('deploy', async ({ bot, ctx }) => {
    await intercept(bot, ctx);

    const app = ctx.app!;
    let text = '';
    try {
      text =
        '\n\n' +
        (await app.opensumiOctoService.getLastNCommitsText({
          owner: 'opensumi',
          repo: 'github-bot',
        }));
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.opensumiOctoService.deployBot();
    await app.opensumiOctoService.deployBotPre();
    await bot.reply(
      convertToDingMarkdown(
        '开始部署机器人',
        '[开始部署机器人 & 预发机器人](https://github.com/opensumi/github-bot/actions)' +
          text,
      ),
    );
  });

  it.on('deploypre', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);

    const app = ctx.app!;
    let workflowRef: string | undefined = undefined;

    if (command.args['workflow-ref']) {
      workflowRef = command.args['workflow-ref'];
    }

    let text = '';
    try {
      text =
        '\n\n' +
        (await app.opensumiOctoService.getLastNCommitsText({
          owner: 'opensumi',
          repo: 'github-bot',
        }));
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.opensumiOctoService.deployBotPre(workflowRef);
    await bot.reply(
      convertToDingMarkdown(
        '开始部署预发机器人',
        '[开始部署预发机器人](https://github.com/opensumi/github-bot/actions)' +
          text,
      ),
    );
  });

  it.on('rc', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);

    await bot.replyText(
      '[rc 命令已经 deprecated, 请使用 nx 命令] 开始发布 next 版本',
    );

    await publishNextVersion('nx', { ctx, bot }, command, 'core');
  });

  it.on('nx', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);
    await publishNextVersion('nx', { ctx, bot }, command, 'core');
  });

  it.on('nx-cb', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);
    await publishNextVersion('nx-cb', { ctx, bot }, command, 'codeblitz');
  });

  it.on('sync', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);
    await syncVersion({ ctx, bot }, command, 'core');
  });
  it.on('sync-cb', async ({ bot, ctx }, command) => {
    await intercept(bot, ctx);
    await syncVersion({ ctx, bot }, command, 'codeblitz');
  });

  it.on(
    'report',
    async ({ bot, ctx }, command) => {
      await intercept(bot, ctx);

      const app = ctx.app!;

      const params = {} as { time?: string };

      if (command.args.t || command.args.time) {
        params.time = command.args.t || command.args.time;
      }

      await app.opensumiOctoService.monthlyReport(params);
      await bot.replyText('Starts generating monthly report.');
    },
    [],
  );
}

async function publishNextVersion(
  command: string,
  { ctx, bot }: IMCommandCenterContext,
  payload: ICommand<any>,
  repo: 'core' | 'codeblitz',
) {
  const app = ctx.app!;

  let ref = payload.args.ref;
  let workflowRef: string | undefined = undefined;
  if (!ref) {
    if (payload.argv.length > 1) {
      ref = payload.argv[1];
    }
    if (payload.args['workflow-ref']) {
      workflowRef = payload.args['workflow-ref'];
    } else {
      workflowRef = ref;
    }
  }

  if (ref) {
    try {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', repo);
      } catch (error) {
        await bot.replyText(
          `找不到 ref: ${ref}, 错误信息: ${(error as Error).message}`,
        );
      }
      const text = await app.opensumiOctoService.getLastNCommitsText({
        owner: 'opensumi',
        repo: repo,
        ref,
      });

      const name = repo === 'core' ? 'OpenSumi' : 'CodeBlitz';
      const workflowInfo =
        repo === 'core'
          ? ActionsRepo.RELEASE_NEXT_BY_REF_WORKFLOW
          : ActionsRepo.CODEBLITZ_RELEASE_NEXT_BY_REF_WORKFLOW;

      await app.opensumiOctoService.releaseNextVersion(
        workflowInfo,
        ref,
        workflowRef,
      );
      await bot.reply(
        convertToDingMarkdown(
          `Releasing a next version of ${name}`,
          `Releasing a [next version of ${name}](${getActionsUrl(
            workflowInfo,
          )}) on ${ref}\n\n${text}`,
        ),
      );
    } catch (error) {
      await bot.replyText(`执行出错：${(error as Error).message}`);
    }
  } else {
    await bot.replyText(`使用方法 ${command} --ref v2.xx 或 ${command} v2.xx`);
  }
}

async function syncVersion(
  { ctx, bot }: IMCommandCenterContext,
  command: ICommand<any>,
  repo: 'core' | 'codeblitz',
) {
  const app = ctx.app!;

  let version = command.args.version;
  let workflowRef: string | undefined = undefined;

  if (!version) {
    if (command.argv.length > 1) {
      version = command.argv[1];
    }
    if (command.args['workflow-ref']) {
      workflowRef = command.args['workflow-ref'];
    }
  }
  try {
    if (repo === 'core') {
      const actionUrl = getActionsUrl({
        ...ActionsRepo.info,
        workflow_id: ActionsRepo.SYNC_FILE,
      });

      await app.opensumiOctoService.syncOpenSumiVersion(version, workflowRef);
      await bot.reply(
        convertToDingMarkdown(
          'Synchronizing OpenSumi packages',
          `[Synchronizing OpenSumi packages${
            version ? `@${version}` : ''
          } to npmmirror](${actionUrl})`,
        ),
      );
    } else {
      const actionUrl = getActionsUrl({
        ...ActionsRepo.info,
        workflow_id: ActionsRepo.SYNC_CODEBLITZ_FILE,
      });

      await app.opensumiOctoService.syncCodeblitzVersion(version, workflowRef);
      await bot.reply(
        convertToDingMarkdown(
          'Synchronizing CodeBlitz packages',
          `[Synchronizing CodeBlitz packages${
            version ? `@${version}` : ''
          } to npmmirror](${actionUrl})`,
        ),
      );
    }
  } catch (error) {
    await bot.replyText(`sync 出错：${(error as Error).message}`);
  }
}

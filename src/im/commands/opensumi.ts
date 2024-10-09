import { ActionsRepo, getActionsUrl } from '@/constants/opensumi';
import {
  ICommand,
  StopError,
  StopErrorWithReply,
} from '@opensumi/bot-commander';

import { IBotAdapter } from '../types';

import { DingDAO } from '@/dao/ding';
import { DingtalkService } from '@/services/dingtalk';
import { KnownRepo } from './constants';
import { CommandCenterContext, Context, IMCommandCenter } from './types';
import { hasApp, replyIfAppNotDefined } from './utils';

/**
 * 拦截本次请求
 */
async function repoIntercept(bot: IBotAdapter, _ctx: Context, repo: string) {
  const defaultRepo = await DingDAO.instance().getDefaultRepo(bot.id);
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

  it.on('deploy', async ({ bot, ctx, session }) => {
    await intercept(bot, ctx);

    const app = ctx.app!;
    let text = '';
    try {
      text =
        '\n\n' +
        (await app.octoService.getLastNCommitsText({
          owner: 'opensumi',
          repo: 'github-bot',
        }));
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.octoService.deployBot();
    await app.octoService.deployBotPre();
    await session.reply(
      DingtalkService.instance().convertToDingMarkdown(
        '开始部署机器人',
        '[开始部署机器人 & 预发机器人](https://github.com/opensumi/github-bot/actions)' +
          text,
      ),
    );
  });

  it.on('deploypre', async ({ bot, ctx, session }, command) => {
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
        (await app.octoService.getLastNCommitsText({
          owner: 'opensumi',
          repo: 'github-bot',
        }));
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.octoService.deployBotPre(workflowRef);
    await session.reply(
      DingtalkService.instance().convertToDingMarkdown(
        '开始部署预发机器人',
        '[开始部署预发机器人](https://github.com/opensumi/github-bot/actions)' +
          text,
      ),
    );
  });

  it.on('rc', async ({ bot, ctx, session }, command) => {
    await intercept(bot, ctx);

    await session.replyText(
      '[rc 命令已经 deprecated, 请使用 nx 命令] 开始发布 next 版本',
    );

    await publishNextVersion('nx', { bot, ctx, session }, command, 'core');
  });

  it.on('nx', async ({ bot, ctx, session }, command) => {
    await intercept(bot, ctx);
    await publishNextVersion('nx', { bot, ctx, session }, command, 'core');
  });

  it.on('nx-cb', async ({ bot, ctx, session }, command) => {
    await intercept(bot, ctx);
    await publishNextVersion(
      'nx-cb',
      { bot, ctx, session },
      command,
      'codeblitz',
    );
  });

  it.on('sync', async ({ bot, ctx, session }, command) => {
    await intercept(bot, ctx);
    await syncVersion({ bot, ctx, session }, command, 'core');
  });
  it.on('sync-cb', async ({ bot, ctx, session }, command) => {
    await intercept(bot, ctx);
    await syncVersion({ bot, ctx, session }, command, 'codeblitz');
  });

  it.on(
    'report',
    async ({ bot, ctx, session }, command) => {
      await intercept(bot, ctx);

      const app = ctx.app!;

      const params = {} as { time?: string };

      if (command.args.t || command.args.time) {
        params.time = command.args.t || command.args.time;
      }

      await app.octoService.monthlyReport(params);
      await session.replyText('Starts generating monthly report.');
    },
    [],
  );
}

async function publishNextVersion(
  command: string,
  { ctx, session }: CommandCenterContext,
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
    }
  }

  if (ref) {
    try {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', repo);
      } catch (error) {
        await session.replyText(
          `找不到 ref: ${ref}, 错误信息: ${(error as Error).message}`,
        );
      }
      const text = await app.octoService.getLastNCommitsText({
        owner: 'opensumi',
        repo,
        ref,
      });

      const name = repo === 'core' ? 'OpenSumi' : 'CodeBlitz';
      const workflowInfo =
        repo === 'core'
          ? { ...ActionsRepo.RELEASE_NEXT_BY_REF_WORKFLOW }
          : { ...ActionsRepo.CODEBLITZ_RELEASE_NEXT_BY_REF_WORKFLOW };

      if (workflowRef) {
        workflowInfo.ref = workflowRef;
      }

      await app.octoService.releaseNextVersion(workflowInfo, ref);
      await session.reply(
        DingtalkService.instance().convertToDingMarkdown(
          `Releasing a next version of ${name}`,
          `Releasing a [next version of ${name}](${getActionsUrl(
            workflowInfo,
          )}) on ${ref}\n\n${text}`,
        ),
      );
    } catch (error) {
      await session.replyText(`执行出错：${(error as Error).message}`);
    }
  } else {
    await session.replyText(
      `使用方法 ${command} --ref v2.xx 或 ${command} v2.xx`,
    );
  }
}

async function syncVersion(
  { ctx, session }: CommandCenterContext,
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

      await app.octoService.syncOpenSumiVersion(version, workflowRef);
      await session.reply(
        DingtalkService.instance().convertToDingMarkdown(
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

      await app.octoService.syncCodeblitzVersion(version, workflowRef);
      await session.reply(
        DingtalkService.instance().convertToDingMarkdown(
          'Synchronizing CodeBlitz packages',
          `[Synchronizing CodeBlitz packages${
            version ? `@${version}` : ''
          } to npmmirror](${actionUrl})`,
        ),
      );
    }
  } catch (error) {
    await session.replyText(`sync 出错：${(error as Error).message}`);
  }
}

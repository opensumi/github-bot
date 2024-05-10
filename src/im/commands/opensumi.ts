import { CoreRepo } from '@/constants/opensumi';
import { convertToDingMarkdown } from '@/github/dingtalk';

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
  it.on('deploy', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;
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
        '开始部署机器人 & 预发机器人' + text,
      ),
    );
  });

  it.on('deploypre', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }
    let workflowRef: string | undefined = undefined;

    if (ctx.parsed.raw['workflow-ref']) {
      workflowRef = ctx.parsed.raw['workflow-ref'];
    }

    const { app } = ctx;
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
      convertToDingMarkdown('开始部署预发机器人', '开始部署预发机器人' + text),
    );
  });

  it.on('rc', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    await bot.replyText(
      '[rc 命令已经 deprecated, 请使用 nx 命令] 开始发布 next 版本',
    );

    await publishNextVersion({ ctx, bot });
  });

  it.on('nx', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    await publishNextVersion({ ctx, bot });
  });

  it.on('sync', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    let version = ctx.parsed.raw.version;
    let workflowRef: string | undefined = undefined;

    if (!version) {
      if (ctx.parsed['_'].length > 1) {
        version = ctx.parsed['_'][1];
      }
      if (ctx.parsed.raw['workflow-ref']) {
        workflowRef = ctx.parsed.raw['workflow-ref'];
      }
    }
    try {
      await app.opensumiOctoService.syncVersion(version, workflowRef);
      await bot.reply(
        convertToDingMarkdown(
          'starts synchronizing packages',
          `[starts synchronizing packages${
            version ? `@${version}` : ''
          } to npmmirror](https://github.com/opensumi/actions/actions/workflows/sync.yml)`,
        ),
      );
    } catch (error) {
      await bot.replyText(`执行出错：${(error as Error).message}`);
    }
  });
  it.on(
    'report',
    async ({ bot, ctx }) => {
      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }
      const { app } = ctx;

      const params = {} as { time?: string };

      if (ctx.parsed.raw.t || ctx.parsed.raw.time) {
        params.time = ctx.parsed.raw.t || ctx.parsed.raw.time;
      }

      await app.opensumiOctoService.monthlyReport(params);
      await bot.replyText('Starts generating monthly report.');
    },
    [],
  );
}

async function publishNextVersion({ ctx, bot }: IMCommandCenterContext) {
  const app = ctx.app!;

  let ref = ctx.parsed.raw.ref;
  let workflowRef: string | undefined = undefined;
  if (!ref) {
    if (ctx.parsed['_'].length > 1) {
      ref = ctx.parsed['_'][1];
    }
    if (ctx.parsed.raw['workflow-ref']) {
      workflowRef = ctx.parsed.raw['workflow-ref'];
    } else {
      workflowRef = ref;
    }
  }

  if (ref) {
    try {
      await app.octoService.getRefInfoByRepo(ref, 'opensumi', 'core');
      const text = await app.opensumiOctoService.getLastNCommitsText({
        owner: 'opensumi',
        repo: 'core',
        ref,
      });

      await app.opensumiOctoService.releaseNextVersion(ref, workflowRef);
      await bot.reply(
        convertToDingMarkdown(
          'Starts releasing the next version',
          `Starts releasing the [next version](https://github.com/opensumi/core/actions/workflows/${CoreRepo.NEXT_WORKFLOW_FILE}) on ${ref}\n\n${text}`,
        ),
      );
    } catch (error) {
      await bot.replyText(`执行出错：${(error as Error).message}`);
    }
  } else {
    await bot.replyText(`使用方法 nx --ref v2.xx 或 nx v2.xx`);
  }
}

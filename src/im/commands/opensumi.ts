import { equalFunc } from '@/commander';
import { RC_WORKFLOW_FILE } from '@/constants/opensumi';

import { markdown } from '../message';
import { IBotAdapter } from '../types';

import { KnownRepo } from './constants';
import { Context, IMCommandCenter } from './types';
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
      text = '\n\n' + (await app.opensumiOctoService.getBotLastNCommitsText());
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.opensumiOctoService.deployBot();
    await app.opensumiOctoService.deployBotPre();
    await bot.reply(
      markdown('开始部署机器人', '开始部署机器人 & 预发机器人' + text),
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

    const { app } = ctx;
    let text = '';
    try {
      text = '\n\n' + (await app.opensumiOctoService.getBotLastNCommitsText());
    } catch (error) {
      console.error(
        `getBotLastNCommitsText error: ${(error as Error).message}`,
      );
    }

    await app.opensumiOctoService.deployBotPre();
    await bot.reply(
      markdown('开始部署预发机器人', '开始部署预发机器人' + text),
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

    const { app } = ctx;

    let ref = ctx.parsed.raw.ref;
    if (!ref) {
      if (ctx.parsed['_'].length > 1) {
        ref = ctx.parsed['_'][1];
      }
    }

    if (ref) {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', 'core');
        await app.opensumiOctoService.releaseRCVersion(ref);
        await bot.reply(
          markdown(
            'Starts releasing the release candidate',
            `Starts releasing the [release candidate](https://github.com/opensumi/core/actions/workflows/${RC_WORKFLOW_FILE}) on ${ref}`,
          ),
        );
      } catch (error) {
        await bot.replyText(`执行出错：${(error as Error).message}`);
      }
    } else {
      await bot.replyText(`使用方法 rc --ref v2.xx 或 rc v2.xx`);
    }
  });

  it.on('nx', async ({ bot, ctx }) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    let ref = ctx.parsed.raw.ref;
    if (!ref) {
      if (ctx.parsed['_'].length > 1) {
        ref = ctx.parsed['_'][1];
      }
    }

    if (ref) {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', 'core');
        await app.opensumiOctoService.releaseRCVersion(ref);
        await bot.reply(
          markdown(
            'Starts releasing the release candidate',
            `Starts releasing the [release candidate](https://github.com/opensumi/core/actions/workflows/${RC_WORKFLOW_FILE}) on ${ref}`,
          ),
        );
      } catch (error) {
        await bot.replyText(`执行出错：${(error as Error).message}`);
      }
    } else {
      await bot.replyText(`使用方法 nx --ref v2.xx 或 nx v2.xx`);
    }
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
    if (!version) {
      if (ctx.parsed['_'].length > 1) {
        version = ctx.parsed['_'][1];
      }
    }
    try {
      await app.opensumiOctoService.syncVersion(version);
      await bot.reply(
        markdown(
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
    equalFunc,
  );
}

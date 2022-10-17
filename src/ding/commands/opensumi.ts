import { equalFunc, startsWith } from '@/commander';

import { DingBot } from '../bot';
import { markdown } from '../message';

import { cc, Context } from './base';
import { KnownRepo } from './constants';
import { hasApp, replyIfAppNotDefined } from './utils';

/**
 * 拦截本次请求
 */
async function repoIntercept(bot: DingBot, ctx: Context, repo: string) {
  const defaultRepo = await bot.kvManager.getDefaultRepo(bot.id);
  if (!defaultRepo) {
    return true;
  }
  if (repo !== `${defaultRepo.owner}/${defaultRepo.repo}`) {
    return true;
  }

  return false;
}

cc.on(
  'deploy',
  async (bot, ctx: Context<{ ref: string }>) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;
    await app.opensumiOctoService.deployBot();
    await bot.replyText('机器人部署任务分发成功');
  },
  [],
  startsWith,
);

cc.on(
  'rc',
  async (bot, ctx: Context<{ ref: string }>) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    let ref = ctx.parsed.ref;
    if (!ref) {
      if (ctx.parsed['_'].length > 1) {
        ref = ctx.parsed['_'][1];
      }
    }

    if (ref) {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', 'core');
        await app.opensumiOctoService.releaseRCVersion(ref);
        await bot.replyText(`在 ${ref} 上发布 Release Candidate 成功`);
      } catch (error) {
        await bot.replyText(`执行出错：${(error as Error).message}`);
      }
    } else {
      await bot.replyText(`使用方法 rc --ref v2.xx 或 rc v2.xx`);
    }
  },
  [],
  equalFunc,
);

cc.on(
  'nx',
  async (bot, ctx: Context<{ ref: string }>) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    let ref = ctx.parsed.ref;
    if (!ref) {
      if (ctx.parsed['_'].length > 1) {
        ref = ctx.parsed['_'][1];
      }
    }

    if (ref) {
      try {
        await app.octoService.getRefInfoByRepo(ref, 'opensumi', 'core');
        await app.opensumiOctoService.releaseRCVersion(ref);
        await bot.replyText(`在 ${ref} 上发布 Release Candidate 成功`);
      } catch (error) {
        await bot.replyText(`执行出错：${(error as Error).message}`);
      }
    } else {
      await bot.replyText(`使用方法 nx --ref v2.xx 或 nx v2.xx`);
    }
  },
  [],
  equalFunc,
);

cc.on(
  'sync',
  async (bot, ctx: Context<{ version: string }>) => {
    if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
      return;
    }

    await replyIfAppNotDefined(bot, ctx);
    if (!hasApp(ctx)) {
      return;
    }

    const { app } = ctx;

    let version = ctx.parsed.version;
    if (!version) {
      if (ctx.parsed['_'].length > 1) {
        version = ctx.parsed['_'][1];
      }
    }
    try {
      await app.opensumiOctoService.syncVersion(version);
      await bot.reply(
        markdown(
          'Sync Started',
          `[Start sync packages${version ? `@${version}` : ''} to npmmirror](https://github.com/opensumi/actions/actions/workflows/sync.yml)`,
        ),
      );
    } catch (error) {
      await bot.replyText(`执行出错：${(error as Error).message}`);
    }
  },
  [],
  equalFunc,
);

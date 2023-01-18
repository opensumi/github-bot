import { equalFunc, startsWith } from '@/commander';
import { RC_WORKFLOW_FILE } from '@/constants/opensumi';

import { DingBot } from '../bot';
import { markdown } from '../message';

import { KnownRepo } from './constants';
import { Context, DingCommandCenter } from './types';
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

export function registerOpenSumiCommand(it: DingCommandCenter) {
  it.on(
    'deploy',
    async (bot: DingBot, ctx: Context<{ ref: string }>) => {
      if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
        return;
      }

      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      await app.opensumiOctoService.deployBot();
      await bot.replyText('开始部署机器人');
    },
    [],
    startsWith,
  );

  it.on(
    'deploypre',
    async (bot: DingBot, ctx: Context<{ ref: string }>) => {
      if (await repoIntercept(bot, ctx, KnownRepo.OpenSumi)) {
        return;
      }

      await replyIfAppNotDefined(bot, ctx);
      if (!hasApp(ctx)) {
        return;
      }

      const { app } = ctx;
      await app.opensumiOctoService.deployBotPre();
      await bot.replyText('开始部署预发机器人');
    },
    [],
    startsWith,
  );

  it.on(
    'rc',
    async (bot: DingBot, ctx: Context<{ ref: string }>) => {
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
          await bot.replyText(
            `在 ${ref} 上发布 Release Candidate 成功, https://github.com/opensumi/core/actions/workflows/${RC_WORKFLOW_FILE}`,
          );
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

  it.on(
    'nx',
    async (bot: DingBot, ctx: Context<{ ref: string }>) => {
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
          await bot.replyText(
            `在 ${ref} 上发布 Release Candidate 成功, https://github.com/opensumi/core/actions/workflows/${RC_WORKFLOW_FILE}`,
          );
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

  it.on(
    'sync',
    async (bot: DingBot, ctx: Context<{ version: string }>) => {
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
            `[Start sync packages${
              version ? `@${version}` : ''
            } to npmmirror](https://github.com/opensumi/actions/actions/workflows/sync.yml)`,
          ),
        );
      } catch (error) {
        await bot.replyText(`执行出错：${(error as Error).message}`);
      }
    },
    [],
    equalFunc,
  );
}

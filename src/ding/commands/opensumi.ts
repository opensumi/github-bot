import { equalFunc, startsWith } from '@/command';
import { DingBot } from '../bot';
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
    await app.service.deployBot();
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
        await app.service.getRefInfoByRepo(ref, 'opensumi', 'core');
        await app.service.releaseRCVersion(ref);
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

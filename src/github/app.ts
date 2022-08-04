import { App } from '@/lib/octo';
import { Octokit } from '@octokit/rest';
import { ISetting, AppSetting, GitHubKVManager } from '@/github/storage';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';
import { sendToDing } from './utils';
import { error } from '@/runtime/response';
import { Env } from '@/env';

export interface Context {
  setting: ISetting;
}

export interface AppContext extends Context {
  setting: AppSetting;
}

export const appFactory = (ctx: AppContext) => {
  const { appSettings, githubSecret } = ctx.setting;
  const _app = new App({
    appId: appSettings.appId,
    privateKey: appSettings.privateKey,
    webhooks: {
      secret: githubSecret,
    },
    Octokit: Octokit,
  });

  setupWebhooksSendToDing(_app.webhooks, ctx);

  _app.webhooks.on('star.created', async ({ payload }) => {
    const repository = payload.repository;
    const starCount = repository.stargazers_count;
    if (starCount % 100 === 0) {
      await sendToDing(
        {
          title: '⭐⭐⭐',
          text: `一个好消息，[${repository.full_name}](${repository.html_url}) 有 ${starCount} 颗 🌟 了~`,
        },
        'star.created',
        ctx.setting,
      );
    }

    // Easter Eggs
    // if (starCount === 1000) {
    //   await sendContentToDing(
    //     image(
    //       'https://img.alicdn.com/imgextra/i3/O1CN01BJvYwd28RX9V5RBlW_!!6000000007929-0-tps-900-383.jpg',
    //     ),
    //     'star.created',
    //     ctx.setting,
    //   );
    // }
  });

  _app.webhooks.on('issue_comment.created', handleComment);
  _app.webhooks.on('issue_comment.edited', handleComment);
  return _app;
};

export type IApp = ReturnType<typeof appFactory>;

export async function initApp(setting: AppSetting) {
  const app = appFactory({
    setting: setting,
  });
  await app.init();
  return app;
}

export async function handler(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  env: Env,
  ctx: ExecutionContext,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  if (!id) {
    return error(401, 'need a valid id');
  }
  const githubKVManager = new GitHubKVManager(env);
  const setting = await githubKVManager.getAppSettingById(id);
  if (!setting) {
    return error(404, 'id not found');
  }
  if (!setting.githubSecret) {
    return error(401, 'please set app webhook secret in settings');
  }

  const app = await initApp(setting);
  return baseHandler(app.webhooks, req, env, ctx);
}

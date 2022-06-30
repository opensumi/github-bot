import { App } from '@/lib/octo';
import { Octokit } from '@octokit/rest';
import { Setting, getDefaultAppSetting, AppSetting } from '@/github/storage';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';
import { sendContentToDing, sendToDing } from './utils';
import { image } from '@/ding/message';
import { renderRepoLink } from './templates';

export interface Context {
  event: FetchEvent;
  request: Request;
  setting: Setting;
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
    const starCount = payload.repository.stargazers_count;
    if (starCount % 100 === 0) {
      await sendToDing(
        {
          title: '⭐⭐⭐',
          text: `一个好消息，${renderRepoLink(
            payload.repository,
          )} 有 ${starCount} 颗 🌟 了~`,
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

export async function initDefaultApp(event: FetchEvent) {
  const setting = getDefaultAppSetting();
  const app = appFactory(setting.appSettings, {
    request: event.request,
    event,
    setting: setting,
  });
  await app.init();
  return app;
}

export async function handler(req: Request, event: FetchEvent) {
  const app = await initDefaultApp(event);
  return baseHandler(app.webhooks, req, event);
}

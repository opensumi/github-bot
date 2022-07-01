import { App } from '@/lib/octo';
import { Octokit } from '@octokit/rest';
import {
  Setting,
  getDefaultAppSetting,
  AppSetting,
  getAppSettingById,
} from '@/github/storage';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';
import { sendToDing } from './utils';
import { renderRepoLink } from './templates';
import { error } from '@/utils';

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

export async function initApp(setting: AppSetting, event: FetchEvent) {
  const app = appFactory({
    request: event.request,
    event,
    setting: setting,
  });
  await app.init();
  return app;
}

export async function initDefaultApp(event: FetchEvent) {
  const setting = getDefaultAppSetting();
  const app = await initApp(setting, event);
  return app;
}

export async function handler(req: Request, event: FetchEvent) {
  const app = await initDefaultApp(event);
  return baseHandler(app.webhooks, req, event);
}

export async function handler2(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  event: FetchEvent,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  if (!id) {
    return error(401, 'need a valid id');
  }
  const setting = await getAppSettingById(id);
  if (!setting) {
    return error(403, 'id not found');
  }
  if (!setting.githubSecret) {
    return error(401, 'please set app webhook secret in settings');
  }

  const app = await initApp(setting, event);
  return baseHandler(app.webhooks, req, event);
}

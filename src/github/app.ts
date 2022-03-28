import { App } from '@/lib/octo';
import { Octokit } from '@octokit/rest';
import secrets, { Setting, getDefaultSetting } from '@/secrets';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';
import { sendToDing } from './utils';

export type Context = {
  event: FetchEvent;
  request: Request;
  setting: Setting;
};

export const appFactory = (ctx: Context) => {
  const _app = new App({
    appId: secrets.appId,
    privateKey: secrets.privateKey,
    webhooks: {
      secret: secrets.webhookSecret,
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
          text: `一个好消息，有 ${starCount} 颗 🌟 了~`,
        },
        'star.created',
        ctx.setting,
      );
    }
  });

  _app.webhooks.on('issue_comment.created', handleComment);
  _app.webhooks.on('issue_comment.edited', handleComment);
  return _app;
};

export type IApp = ReturnType<typeof appFactory>;

export async function getInitedApp(event: FetchEvent) {
  const dingSecret = getDefaultSetting();
  const app = appFactory({
    request: event.request,
    event,
    setting: dingSecret,
  });
  await app.init();
  return app;
}

export async function handler(req: Request, event: FetchEvent) {
  const app = await getInitedApp(event);
  return baseHandler(app.webhooks, req, event);
}

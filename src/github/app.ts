import { App } from '@/lib/octo';
import { Octokit } from '@octokit/rest';
import secrets, { Setting, getDefaultSetting } from '@/github/storage';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';
import { sendContentToDing, sendToDing } from './utils';
import { image } from '@/ding/message';

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

    if (starCount === 1000) {
      await sendContentToDing(
        image(
          'https://img.alicdn.com/imgextra/i3/O1CN01BJvYwd28RX9V5RBlW_!!6000000007929-0-tps-900-383.jpg',
        ),
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

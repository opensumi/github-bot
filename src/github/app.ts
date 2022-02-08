import { App } from '@/lib/octo';
import { lazyValue } from '@/utils';
import secrets from '@/secrets';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { handleComment } from './commands';

export type Context = {
  event: FetchEvent;
  request: Request;
};

export const appFactory = (ctx?: Context) => {
  const _app = new App({
    appId: secrets.appId,
    privateKey: secrets.privateKey,
    // oauth: {
    //   clientId: secrets.clientId,
    //   clientSecret: secrets.clientSecret,
    // },
    webhooks: {
      secret: secrets.webhookSecret,
    },
  });

  setupWebhooksSendToDing(_app.webhooks, ctx);

  _app.webhooks.on('issue_comment.created', handleComment);
  _app.webhooks.on('issue_comment.edited', handleComment);

  return _app;
};

export const app = lazyValue(appFactory);

export async function handler(req: Request, event: FetchEvent) {
  const app = appFactory({
    request: req,
    event,
  });
  return baseHandler(app.webhooks, req, event);
}

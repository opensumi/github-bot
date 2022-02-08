import { App } from '@/lib/octo';
import { baseHandler, setupWebhooksSendToDing } from './handler';
import { lazyValue } from '@/utils';
import { handleComment } from './commands';
import secrets from '@/secrets';

// App 的 Construct 中会校验 appId 是否有效等，这里先暂时使用 lazyValue
export const app = lazyValue(() => {
  // https://github.com/octokit/app.js
  // 因为这个包只是为 node 写的，里面会引入 buffer 等包，在 worker 里不能使用
  // 这里从自己重写的包引入进来
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

  setupWebhooksSendToDing(_app.webhooks);

  _app.webhooks.on('issue_comment.created', handleComment);
  _app.webhooks.on('issue_comment.edited', handleComment);

  return _app;
});

export async function handler(req: Request, event: FetchEvent) {
  return baseHandler(app().webhooks, req, event);
}

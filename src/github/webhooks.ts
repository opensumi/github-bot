import { Webhooks } from '@octokit/webhooks';
import { MarkdownContent, supportTemplates, templates } from './template';

type THasAction = {
  action?: string;
};

type WebhookCb = (data: MarkdownContent) => Promise<void>;

export const setupWebhooks = (webhooks: Webhooks, cb: WebhookCb) => {
  webhooks.onAny(async ({ id, name, payload }) => {
    console.log('Receive Github Webhook, id: ', id, ', name: ', name);
    if ((payload as THasAction)?.action) {
      console.log('payload.action: ', (payload as THasAction).action);
    }
    console.log(
      'Currently Support: ',
      supportTemplates.filter((v) => v.startsWith(name)),
    );
  });

  supportTemplates.forEach((emitName) => {
    webhooks.on(emitName, async ({ id, payload }) => {
      console.log(
        'Current Handle Github Webhook, id: ',
        id,
        '， emitName:',
        emitName,
      );
      const handler = templates[emitName] as (payload: any) => MarkdownContent;
      const data = handler(payload);
      await cb(data);
    });
  });
};

export const makeWebhooks = (cb: WebhookCb) => {
  const webhooks = new Webhooks({
    secret: GH_WEBHOOK_SECRET,
  });
  setupWebhooks(webhooks, cb);
  return webhooks;
};

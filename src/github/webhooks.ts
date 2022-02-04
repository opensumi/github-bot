import { Webhooks } from '@octokit/webhooks';
import { supportTemplates, templates } from './templates';
import { sendToDing } from './utils';
import type { MarkdownContent, THasAction } from './types';

export const setupWebhooksSendToDing = (webhooks: Webhooks) => {
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
      await sendToDing(data.title, data.text);
    });
  });
};

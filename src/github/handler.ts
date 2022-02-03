import { error, message } from '../utils';
import { WebhookEventHandlerError } from '@octokit/webhooks/dist-types/types';
import { sendToDing } from './utils';
import { makeWebhooks } from './webhooks';
import { validate, ValidationError } from './validate';
import { Webhooks } from '@octokit/webhooks';

export async function baseHandler(
  webhooks: Webhooks,
  req: Request,
  event: FetchEvent,
) {
  try {
    const { id, event: eventName, payload } = await validate(req, webhooks);

    try {
      event.waitUntil(
        webhooks.receive({
          id: id,
          name: eventName as any,
          payload: payload,
        }),
      );
      return message('ok');
    } catch (err) {
      const statusCode = Array.from(err as WebhookEventHandlerError)[0].status;
      const status = typeof statusCode !== 'undefined' ? statusCode : 500;
      return error(status, String(err));
    }
  } catch (err) {
    const errorCode = (err as ValidationError).code ?? 500;
    const message =
      (err as ValidationError).message ?? 'Unknown error in validation';
    return error(errorCode, message);
  }
}

export async function handler(req: Request, event: FetchEvent) {
  const webhooks = makeWebhooks(async (data) => {
    await sendToDing(data.title, data.text);
  });
  return baseHandler(webhooks, req, event);
}

import { error, lazyValue, message } from '@/utils';
import {
  WebhookEventHandlerError,
  EmitterWebhookEventName,
} from '@octokit/webhooks/dist-types/types';
import { setupWebhooksSendToDing } from './webhooks';
import { Webhooks } from '@octokit/webhooks';
import secrets from '@/secrets';

export class ValidationError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export async function validateGithub(req: Request, webhooks: Webhooks) {
  const headers = req.headers;

  if (!headers.get('User-Agent')?.startsWith('GitHub-Hookshot/')) {
    console.warn('User agent: not from GitHub');
    throw new ValidationError(403, 'User agent: not from GitHub');
  }
  if (headers.get('Content-Type') !== 'application/json') {
    console.warn('Content type: not json');
    throw new ValidationError(415, 'Content type: not json');
  }

  const event = headers.get('x-github-event') as EmitterWebhookEventName;
  const signatureSHA256 = headers.get('x-hub-signature-256') as string;
  const id = headers.get('x-github-delivery') as string;

  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    throw new ValidationError(400, 'Invalid JSON');
  }

  if (!signatureSHA256) {
    throw new ValidationError(401, 'please set webhook secret in settings');
  }

  const matchesSignature = await webhooks.verify(
    payload,
    signatureSHA256.replace('sha256=', ''),
  );
  if (!matchesSignature) {
    throw new ValidationError(
      401,
      'signature does not match event payload and secret, please reset webhook secret',
    );
  }
  return {
    id,
    event,
    payload,
  };
}

export async function baseHandler(
  webhooks: Webhooks,
  req: Request,
  event: FetchEvent,
) {
  try {
    const {
      id,
      event: eventName,
      payload,
    } = await validateGithub(req, webhooks);

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
      let status = 500;
      if ((err as WebhookEventHandlerError).name === 'AggregateError') {
        const statusCode = Array.from(err as WebhookEventHandlerError)[0]
          .status;
        if (statusCode) {
          status = statusCode;
        }
      }
      if ((err as any).code) {
        status = (err as any).code;
      }
      return error(status, String(err));
    }
  } catch (err) {
    const errorCode = (err as ValidationError).code ?? 500;
    const message =
      (err as ValidationError).message ?? 'Unknown error in validation';
    return error(errorCode, message);
  }
}

const webhooks = lazyValue(() => {
  return new Webhooks({
    secret: secrets.ghWebhookSecret,
  });
});

// 如果只是想简单使用 webhooks 的回调，这个函数来处理
export async function handler(req: Request, event: FetchEvent) {
  setupWebhooksSendToDing(webhooks());
  return baseHandler(webhooks(), req, event);
}

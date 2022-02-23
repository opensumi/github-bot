import {
  WebhookEventHandlerError,
  EmitterWebhookEventName,
} from '@octokit/webhooks/dist-types/types';
import { Webhooks } from '@octokit/webhooks';
import { error, message } from '@/utils';
import { getTemplates, StopHandleError } from './templates';
import { getSettingById } from '@/secrets';
import { sendToDing } from './utils';
import type { MarkdownContent, THasAction } from './types';
import { Octokit } from '@octokit/core';
import { Context } from './app';

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

export const setupWebhooksSendToDing = (
  webhooks: Webhooks<{ octokit?: Octokit }>,
  ctx: Context,
) => {
  const templates = getTemplates(ctx);
  const supportTemplates = Object.keys(templates) as EmitterWebhookEventName[];

  webhooks.onAny(async ({ id, name, payload }) => {
    console.log('Receive Github Webhook, id: ', id, ', name: ', name);
    if ((payload as THasAction)?.action) {
      console.log('payload.action: ', (payload as THasAction).action);
    }
  });
  for (const emitName of supportTemplates) {
    webhooks.on(emitName, async ({ id, payload, octokit }) => {
      console.log(emitName, 'handled id:', id);
      const handlerCtx = {
        ...ctx,
        octokit,
      };
      const handler = templates[emitName] as (
        payload: any,
        ctx: any,
      ) => Promise<MarkdownContent>;

      try {
        console.log('run handler:', handler?.name);

        const data = await handler(payload, handlerCtx);
        console.log('get data from handler: ', data);

        await sendToDing(data.title, data.text, ctx.setting);
      } catch (err) {
        console.log('stop handler because: ', (err as Error).message);
        if (!(err instanceof StopHandleError)) {
          throw err;
        }
      }
    });
  }
};

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

const webhooksFactory = (secret: string) => {
  return new Webhooks({
    secret,
  });
};

export async function webhookHandler(
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
  const dingSecret = await getSettingById(id);
  if (!dingSecret) {
    return error(403, 'id not found');
  }

  const webhooks = webhooksFactory(dingSecret.githubSecret);

  setupWebhooksSendToDing(webhooks as any, {
    setting: dingSecret,
    event,
    request: req,
  });
  return baseHandler(webhooks, req, event);
}

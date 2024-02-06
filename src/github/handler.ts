import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';
import {
  WebhookEventHandlerError,
  EmitterWebhookEventName,
} from '@octokit/webhooks/dist-types/types';
import { HonoRequest } from 'hono';

import { error, json } from '@/api/utils/response';
import Environment from '@/env';
import { Logger } from '@/utils/logger';

import { getTemplates, StopHandleError } from './templates';
import type { Context, IHasSender, TemplateRenderResult } from './types';

export class ValidationError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export interface IGitHubEvent {
  id: string;
  event: EmitterWebhookEventName;
  text: string;
  payload: any;
}

export async function validateGithub(
  // eslint-disable-next-line @typescript-eslint/ban-types
  req: HonoRequest<any, {}>,
  webhooks: Webhooks,
): Promise<IGitHubEvent> {
  const headers = req.raw.headers;

  if (!headers.get('User-Agent')?.startsWith('GitHub-Hookshot/')) {
    console.warn('User agent: not from GitHub');
    throw new ValidationError(403, 'User agent: not from GitHub');
  }
  if (headers.get('Content-Type') !== 'application/json') {
    console.warn('Content type: not json');
    throw new ValidationError(415, 'Content type: not json');
  }

  const event = headers.get('x-github-event') as EmitterWebhookEventName;
  const signature = headers.get('x-hub-signature-256') as string;
  const id = headers.get('x-github-delivery') as string;

  const text = await req.text();

  if (!signature) {
    throw new ValidationError(
      401,
      'x-hub-signature-256 is null. please set webhook secret in github app settings',
    );
  }

  const matchesSignature = await webhooks.verify(text, signature);
  if (!matchesSignature) {
    throw new ValidationError(
      401,
      'signature does not match event payload and secret, please reset webhook secret',
    );
  }

  const payload = JSON.parse(text);

  return {
    id,
    event,
    text,
    payload,
  };
}

const blockedUser = new Set(['renovate[bot]']);

export const setupWebhooksTemplate = (
  webhooks: Webhooks<{ octokit?: Octokit }>,
  context: Context,
  done: (data: {
    markdown: TemplateRenderResult;
    eventName: EmitterWebhookEventName;
    payload: any;
  }) => Promise<void>,
) => {
  const templates = getTemplates(context);
  const supportTemplates = Object.keys(templates) as EmitterWebhookEventName[];

  for (const eventName of supportTemplates) {
    webhooks.on(eventName, async ({ id, payload, octokit }) => {
      if ((payload as IHasSender)?.sender) {
        const name = (payload as IHasSender).sender.login;
        if (blockedUser.has(name)) {
          return;
        }
      }

      console.log(eventName, 'handled id:', id);

      const handler = templates[eventName];
      if (!handler) {
        throw new Error('no handler for ' + eventName);
      }

      try {
        console.log('run handler:', handler?.name);

        const markdown = await handler(payload, {
          ...context,
          octokit,
        } as any);

        console.log('get data from handler: ', markdown);

        await done({ markdown, eventName, payload });
      } catch (err) {
        console.log('stop handler because: ', err);
        if (!(err instanceof StopHandleError)) {
          throw err;
        }
      }
    });
  }
};

export async function webhookHandler(
  botId: string,
  type: 'github-app' | 'github-webhook',
  webhooks: Webhooks<{ octokit?: Octokit }>,
  execContext: ExecutionContext,
  data: IGitHubEvent,
  useQueue?: boolean,
) {
  const { id, event: eventName, payload } = data;
  const logger = Logger.instance();
  try {
    logger.info('Receive Github Webhook, id: ', id, ', name: ', eventName);
    try {
      const webhookEvent = {
        id: id,
        name: eventName as any,
        payload: payload,
      };
      if (useQueue) {
        const queueItem = {
          botId,
          type,
          data: webhookEvent,
        };
        logger.info('send to queue', queueItem);
        await Environment.instance().Queue.send(queueItem, {
          contentType: 'json',
        });
      } else {
        execContext.waitUntil(webhooks.receive(webhookEvent));
      }

      return json({
        id: id,
        name: eventName,
        message: 'ok',
      });
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
    const errorCode = (err as ValidationError).statusCode ?? 500;
    const message =
      (err as ValidationError).message ?? 'Unknown error in validation';

    return error(errorCode, message);
  }
}

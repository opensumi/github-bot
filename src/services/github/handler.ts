import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';
import type { WebhookEventName } from '@octokit/webhooks-types';
import {
  EmitterWebhookEvent,
  EmitterWebhookEventName,
} from '@octokit/webhooks/dist-types/types';
import { HonoRequest } from 'hono';

import {
  StopHandleError,
  TemplateRenderResult,
  depManageBotToIgnore,
  getTemplates,
} from './templates';
import type { Context, IHasSender } from './types';

export class ValidationError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export async function validateGithub(
  req: HonoRequest<any, {}>,
  webhooks: Webhooks,
): Promise<EmitterWebhookEvent> {
  const headers = req.raw.headers;

  if (!headers.get('User-Agent')?.startsWith('GitHub-Hookshot/')) {
    console.warn('User agent: not from GitHub');
    throw new ValidationError(403, 'User agent: not from GitHub');
  }
  if (headers.get('Content-Type') !== 'application/json') {
    console.warn('Content type: not json');
    throw new ValidationError(415, 'Content type: not json');
  }

  const name = headers.get('x-github-event') as WebhookEventName;
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
    name,
    payload,
  } as EmitterWebhookEvent;
}

export const setupWebhooksTemplate = (
  webhooks: Webhooks<{ octokit?: Octokit }>,
  context: Context,
  done: (data: {
    markdown: TemplateRenderResult;
    name: WebhookEventName;
    eventName: EmitterWebhookEventName;
    payload: any;
  }) => Promise<void>,
) => {
  const templates = getTemplates(context);
  const supportTemplates = Object.keys(templates) as EmitterWebhookEventName[];

  for (const eventName of supportTemplates) {
    webhooks.on(eventName, async ({ id, name, payload, octokit }) => {
      if ((payload as IHasSender)?.sender) {
        const name = (payload as IHasSender).sender.login;
        if (depManageBotToIgnore.has(name)) {
          console.log('skip event because of blocked user:', name);
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

        await done({ markdown, name, eventName, payload });
      } catch (err) {
        console.log('stop handler because: ', err);
        if (!(err instanceof StopHandleError)) {
          throw err;
        }
      }
    });
  }
};

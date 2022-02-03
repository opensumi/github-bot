import { Webhooks } from '@octokit/webhooks';
import {
  EmitterWebhookEventName,
  WebhookEventHandlerError,
} from '@octokit/webhooks/dist-types/types';
import { error } from '../utils';

export class ValidationError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export async function validate(req: Request, webhooks: Webhooks) {
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

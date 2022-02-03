import { App } from '@octokit/app';
import { baseHandler } from '.';
import { sendToDing } from './utils';
import { setupWebhooks } from './webhooks';

const appId = '';
const secret = '';
const privateKey = '';

// https://github.com/octokit/app.js
export const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret,
  },
});

setupWebhooks(app.webhooks, async (data) => {
  await sendToDing(data.title, data.text);
});

export async function handler(req: Request, event: FetchEvent) {
  return baseHandler(app.webhooks, req, event);
}

import { App } from '@octokit/app';
import { baseHandler } from '.';
import { sendToDing } from './utils';
import { setupWebhooks } from './webhooks';

// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot
const appId = GH_APP_ID;
const webhookSecret = GH_APP_WEBHOOK_SECRET;
const privateKey = GH_APP_PRIVATE_KEY;

// https://github.com/octokit/app.js
export const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

setupWebhooks(app.webhooks, async (data) => {
  await sendToDing(data.title, data.text);
});

app.webhooks.on('issue_comment.created', async ({ octokit, payload }) => {
  const { issue, comment, repository } = payload;
  if (comment.body === '/ping') {
    await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: 'Hello there 👋',
      },
    );
  }
});

export async function handler(req: Request, event: FetchEvent) {
  return baseHandler(app.webhooks, req, event);
}

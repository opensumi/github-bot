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

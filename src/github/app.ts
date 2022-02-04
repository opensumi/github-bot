import { App } from './octo';
import { baseHandler } from '.';
import { sendToDing } from './utils';
import { setupWebhooks } from './webhooks';
import { lazyValue } from '../utils';
import { CommandCenter } from '../command';
import { Octokit } from '@octokit/core';
import { ExtractPayload } from './types';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot
let appId = '';
let webhookSecret = '';
let privateKey = '';

try {
  appId = GH_APP_ID;
  webhookSecret = GH_APP_WEBHOOK_SECRET;
  privateKey = GH_APP_PRIVATE_KEY;
} catch (error) {}

type IssueCommentHandler = (
  octokit: Octokit,
  payload: ExtractPayload<'issue_comment'>,
) => Promise<void>;

const issueCc = new CommandCenter<IssueCommentHandler>();

issueCc.on('ping', async (octokit, payload) => {
  const { issue, repository } = payload;

  await octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: 'Hello there 👋',
    },
  );
});

const handleComment = async ({
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: ExtractPayload<'issue_comment'>;
}) => {
  const { comment } = payload;

  const handler = await issueCc.resolveHandler(comment.body);
  await handler?.(octokit, payload);
};

// App 的 Construct 中会校验 appId 是否有效等，这里先暂时使用 lazyValue
export const app = lazyValue(() => {
  // https://github.com/octokit/app.js
  // 因为这个包只是为 node 写的，里面会引入 buffer 等包，在 worker 里不能使用
  // 这里从自己重写的包引入进来
  const _app = new App({
    appId,
    privateKey,
    webhooks: {
      secret: webhookSecret,
    },
  });

  setupWebhooks(_app.webhooks, async (data) => {
    await sendToDing(data.title, data.text);
  });
  _app.webhooks.on('issue_comment.created', handleComment);
  _app.webhooks.on('issue_comment.edited', handleComment);

  return _app;
});

export async function handler(req: Request, event: FetchEvent) {
  console.log('revieve');

  return baseHandler(app().webhooks, req, event);
}

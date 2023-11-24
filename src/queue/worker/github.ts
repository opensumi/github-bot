import { Webhooks } from '@octokit/webhooks';

import { initApp } from '@/github/app';
import { webhookHandler } from '@/github/handler';
import { GitHubKVManager } from '@/kv/github';

import { IGitHubEventQueueMessage } from '../types';

export const githubWorker = async (
  message: Message<IGitHubEventQueueMessage>,
  env: IRuntimeEnv,
  ctx: ExecutionContext,
) => {
  const { body } = message;
  const { botId, type, data } = body;

  const githubKVManager = new GitHubKVManager();
  const setting = await githubKVManager.getAppSettingById(botId);

  if (setting && setting.githubSecret) {
    const app = await initApp(setting);

    await webhookHandler(botId, type, app.webhooks, ctx, data, true);
  } else {
    // todo logger
  }
};

export const githubWebhookWorker = async (
  message: Message<IGitHubEventQueueMessage>,
  env: IRuntimeEnv,
  ctx: ExecutionContext,
) => {
  const { body } = message;
  const { botId, type, data } = body;

  const githubKVManager = new GitHubKVManager();
  const setting = await githubKVManager.getSettingById(botId);

  if (setting && setting.githubSecret) {
    const webhooks = new Webhooks<{ octokit: undefined }>({
      secret: setting.githubSecret,
    });

    await webhookHandler(botId, type, webhooks, ctx, data, true);
  } else {
    // todo logger
  }
};

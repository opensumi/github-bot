import { Webhooks } from '@octokit/webhooks';

import { webhookHandler, setupWebhooksTemplate } from '@/github';
import Configuration from '@/github/configuration';
import { GitHubKVManager } from '@/github/storage';

export function route(hono: THono) {
  hono.post('/webhook/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const githubKVManager = new GitHubKVManager(c.env);
    const setting = await githubKVManager.getSettingById(id);
    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }
    if (!setting.githubSecret) {
      return c.send.error(400, 'please set webhook secret in database');
    }

    Configuration.fromSettings(setting);

    const webhooks = new Webhooks<{ octokit: undefined }>({
      secret: setting.githubSecret,
    });

    setupWebhooksTemplate(webhooks, {
      setting: setting,
    });
    return webhookHandler(webhooks, c.req, c.env, c.executionCtx);
  });
}

import { Webhooks } from '@octokit/webhooks';

import {
  webhookHandler,
  setupWebhooksTemplate,
  validateGithub,
} from '@/github';
import { sendToDing } from '@/github/utils';
import { GitHubKVManager } from '@/kv/github';

export function route(hono: THono) {
  hono.post('/webhook/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const setting = await GitHubKVManager.instance().getSettingById(id);

    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }
    if (!setting.githubSecret) {
      return c.send.error(400, 'please set webhook secret in database');
    }

    const webhooks = new Webhooks<{
      octokit: undefined;
    }>({
      secret: setting.githubSecret,
    });

    const payload = await validateGithub(c.req, webhooks);

    setupWebhooksTemplate(
      webhooks,
      {
        setting,
      },
      async ({ markdown, eventName }) => {
        await sendToDing(markdown, eventName, setting);
      },
    );

    return webhookHandler(
      id,
      'github-webhook',
      webhooks,
      c.executionCtx,
      payload,
    );
  });
}

import { Webhooks } from '@octokit/webhooks';

import { GitHubDAO } from '@/dao/github';
import { DingtalkService } from '@/services/dingtalk';
import { setupWebhooksTemplate, validateGithub } from '@/services/github';
import { WebhookService } from '@/services/webhook';

export function route(hono: THono) {
  hono.get('/webhook/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }

    const setting = await GitHubDAO.instance().getSettingById(id);

    if (setting) {
      return c.json({
        success: true,
      });
    }

    return c.json(
      {
        success: false,
      },
      404,
    );
  });

  hono.post('/webhook/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const setting = await GitHubDAO.instance().getSettingById(id);

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
        await DingtalkService.instance().sendToDing(
          markdown,
          eventName,
          setting,
        );
      },
    );

    return WebhookService.instance().handle(
      id,
      'github-webhook',
      webhooks,
      c.executionCtx,
      payload,
    );
  });
}

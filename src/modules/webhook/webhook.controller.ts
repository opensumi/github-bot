import { webhookHandler, setupWebhooksTemplate } from '@/github';
import { GitHubKVManager } from '@/github/storage';
import { BaseController } from '../base/base.controller';
import { Webhooks } from '@octokit/webhooks';

export class WebhookController extends BaseController {
  handle(): void {
    // 接收 Github webhook 事件
    this.post('/webhook/:id', async (c) => {
      const id = c.req.param('id') ?? c.req.query('id');
      if (!id) {
        return c.send.error(401, 'need a valid id');
      }
      const githubKVManager = new GitHubKVManager(c.env);
      const setting = await githubKVManager.getSettingById(id);
      if (!setting) {
        return c.send.error(404, 'id not found');
      }
      if (!setting.githubSecret) {
        return c.send.error(401, 'please set webhook secret in kv');
      }
      const webhooks = new Webhooks<{ octokit: undefined }>({
        secret: setting.githubSecret,
      });

      setupWebhooksTemplate(webhooks, {
        setting: setting,
      });
      return webhookHandler(webhooks, c.req, c.env, c.executionCtx);
    });
  }
}

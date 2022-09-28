import { baseHandler, setupWebhooksTemplate, webhooksFactory } from '@/github';
import { GitHubKVManager } from '@/github/storage';
import { BaseController } from '../base/base.controller';

export class WebhookController extends BaseController {
  handle(): void {
    // 接收 Github webhook 事件
    this.hono.post('/webhook/:id', async (c) => {
      const id = c.req.param('id') ?? c.req.query('id');
      if (!id) {
        return c.error(401, 'need a valid id');
      }
      const githubKVManager = new GitHubKVManager(c.env);
      const setting = await githubKVManager.getSettingById(id);
      if (!setting) {
        return c.error(404, 'id not found');
      }
      if (!setting.githubSecret) {
        return c.error(401, 'please set webhook secret in kv');
      }

      const webhooks = webhooksFactory(setting.githubSecret);

      setupWebhooksTemplate(webhooks as any, {
        setting: setting,
      });
      return baseHandler(webhooks, c.req, c.env, c.executionCtx);
    });
  }
}

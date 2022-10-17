import { webhookHandler } from '@/github';
import { initApp } from '@/github/app';
import { GitHubKVManager } from '@/github/storage';

import { BaseController } from '../base/base.controller';

export class GitHubController extends BaseController {
  handle() {
    // 接收 Github App 的 webhook 事件
    this.post('/github/app/:id', async (c) => {
      const id = c.req.param('id') ?? c.req.query('id');
      if (!id) {
        return c.send.error(401, 'need a valid id');
      }
      const githubKVManager = new GitHubKVManager(c.env);
      const setting = await githubKVManager.getAppSettingById(id);
      if (!setting) {
        return c.send.error(404, 'id not found');
      }
      if (!setting.githubSecret) {
        return c.send.error(401, 'please set app webhook secret in settings');
      }

      const app = await initApp(setting);
      return webhookHandler(app.webhooks, c.req, c.env, c.executionCtx);
    });
  }
}

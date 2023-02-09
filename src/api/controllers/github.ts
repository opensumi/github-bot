import { webhookHandler } from '@/github';
import { initApp } from '@/github/app';
import { GitHubKVManager } from '@/github/storage';

export function route(hono: THono) {
  hono.post('/github/app/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const githubKVManager = new GitHubKVManager();
    const setting = await githubKVManager.getAppSettingById(id);

    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }
    if (!setting.githubSecret) {
      return c.send.error(400, 'please set app webhook secret in database');
    }

    const app = await initApp(setting);
    return webhookHandler(app.webhooks, c.req, c.env, c.executionCtx);
  });
}

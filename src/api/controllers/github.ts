import { webhookHandler } from '@/github';
import { initApp } from '@/github/app';
import { GitHubKVManager } from '@/kv/github';

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
    return webhookHandler(app.webhooks, c.req, c.executionCtx);
  });

  hono.get('/github/installation-token/:id', async (c) => {
    const id = c.req.param('id');
    const flag = c.req.query('flag');
    if (!id || !flag) {
      return c.send.error(400, `Bad request(id: ${id} flag:${flag})`);
    }

    // 先查数据库有没有设置这个 id 对应的 installation id
    const githubKVManager = new GitHubKVManager();
    const setting = await githubKVManager.getAppSettingById(id);

    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }

    if (!setting.installation || !setting.installation.flags) {
      return c.send.error(400, 'no installation id found in database');
    }

    const { installation } = setting;
    const installationId = installation.flags[flag];
    if (typeof installationId === 'undefined') {
      return c.send.error(400, 'flag not match');
    }

    const app = await initApp(setting);
    return c.json(await app.createInstallationAccessToken(installationId));
  });
}

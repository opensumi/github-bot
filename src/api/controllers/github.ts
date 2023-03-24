import { webhookHandler } from '@/github';
import { initApp } from '@/github/app';
import { checkTokenValid } from '@/github/octokit/token';
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
    return webhookHandler(app.webhooks, c.req, c.executionCtx);
  });

  hono.get('/github/installation-token/:id', async (c) => {
    const id = c.req.param('id');
    const token = c.req.query('token');
    const flag = c.req.query('flag');
    if (!token || !flag) {
      return c.send.error(403, 'invalid request');
    }
    // 如果这个 token 有对应 id 的指定仓库写权限，意味着可以换出来一个安装 token
    const isValid = await checkTokenValid(token);
    if (!isValid) {
      return c.send.error(401, 'invalid token');
    }

    return c.send.message(token);
  });
}

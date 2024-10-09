import { Octokit } from '@octokit/core';

import { GitHubDAO } from '@/dao/github';
import { validateGithub } from '@/services/github';
import { initApp } from '@/services/github/app';
import { WebhookService } from '@/services/webhook';

export function route(hono: THono) {
  hono.post('/github/app/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }

    const setting = await GitHubDAO.instance().getAppSettingById(id);

    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }
    if (!setting.githubSecret) {
      return c.send.error(400, 'please set app webhook secret in database');
    }

    const app = await initApp(setting);
    const payload = await validateGithub(c.req, app.webhooks);
    app.listenWebhooks();

    return WebhookService.instance().handle(
      id,
      'github-app',
      app.webhooks,
      c.executionCtx,
      payload,
    );
  });

  hono.get('/github/installation-token/:id', async (c) => {
    const id = c.req.param('id');
    if (!id) {
      return c.send.error(400, `Bad request(id: ${id})`);
    }

    const authorization = c.req.header('Authorization');
    let flag: string | undefined;
    if (authorization) {
      if (authorization.startsWith('flag ')) {
        flag = authorization.slice('flag '.length);
      }
    }

    if (!flag) {
      return c.send.error(401, 'Unauthorized: missing flag');
    }

    // 先查数据库有没有设置这个 id 对应的 installation id
    const setting = await GitHubDAO.instance().getAppSettingById(id);

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

  hono.delete('/github/installation-token/:id', async (c) => {
    const id = c.req.param('id');
    if (!id) {
      return c.send.error(400, `Bad request(id: ${id})`);
    }

    const authorization = c.req.header('Authorization');
    let flag: string | undefined;
    if (authorization) {
      if (authorization.startsWith('flag ')) {
        flag = authorization.slice('flag '.length);
      }
    }

    if (!flag) {
      return c.send.error(401, 'Unauthorized: missing flag');
    }

    const token = c.req.header('Token');
    if (!token) {
      return c.send.error(400, 'Bad Request: missing token');
    }

    // 先查数据库有没有设置这个 id 对应的 installation id
    const setting = await GitHubDAO.instance().getAppSettingById(id);

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

    const octokit = new Octokit({
      auth: token,
    });

    const result = await octokit.request('DELETE /installation/token', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return c.json(
      {
        success: result.status === 204,
      },
      result.status,
    );
  });
}

import { html } from 'hono/html';

import { CommonKVManager } from '@/kv/admin';
import { DingKVManager } from '@/kv/ding';
import { GitHubKVManager } from '@/kv/github';
import { settingsTypes, SettingType } from '@/kv/types';
import UnauthorizedHTML from '@/public/configuration/401.html';
import ConfigurationHTML from '@/public/configuration/configuration.html';

export function route(hono: THono) {
  hono.use('/configuration/:id/*', async (c, next) => {
    const token = c.req.query('token');
    const id = c.req.param('id');

    const kv = new CommonKVManager();
    const valid = await kv.isTokenValidFor(token, id);
    if (valid) {
      await next();
      return;
    }

    console.log('Unauthorized', token, id);
    return c.html(html`${UnauthorizedHTML}`, 401);
  });

  hono.get('/configuration/:id', async (c) => {
    const id = c.req.param('id');
    const token = c.req.query('token');
    const params = new URLSearchParams();
    if (token) params.append('token', token);

    return c.html(
      html`<!DOCTYPE html>
        <h1>Hello!</h1>

        ${settingsTypes.map(
          (v) =>
            html`<a href="/configuration/${id}/${v}?${params.toString()}"
                >${v}</a
              ><br />`,
        )} `,
    );
  });

  hono.post('/configuration/:id/:type', async (c) => {
    const id = c.req.param('id');

    if (!id) {
      return c.send.error(404, 'Not Found: id in query');
    }
    const type = c.req.param('type') as SettingType;
    if (!settingsTypes.includes(type as SettingType)) {
      return c.send.error(404, 'Not Found: type is not valid');
    }
    const data = await c.req.json();
    if (type === 'app-settings') {
      const kvManager = new GitHubKVManager();
      await kvManager.setAppSettingById(id, data);
    } else if (type === 'setting') {
      const kvManager = new GitHubKVManager();
      await kvManager.setSettingById(id, data);
    } else if (type === 'ding-setting') {
      const kvManager = new DingKVManager();
      await kvManager.setSettingById(id, data);
    } else if (type === 'ding-info') {
      const kvManager = new DingKVManager();
      await kvManager.setDingInfo(id, data);
    }
    return c.json({ success: true });
  });

  hono.get('/configuration/:id/:type', async (c) => {
    const id = c.req.param('id');

    const token = c.req.query('token')!;

    if (!id) {
      return c.text('Not Found: id in query', 404);
    }
    const type = c.req.param('type') as SettingType;
    if (!settingsTypes.includes(type as SettingType)) {
      return c.text('Not Found:' + type, 404);
    }
    const schemaUrl = `${c.origin}static/json-schemas/${type}`;

    let data = null;

    if (type === 'app-settings') {
      const kvManager = new GitHubKVManager();
      data = await kvManager.getAppSettingById(id);
    } else if (type === 'setting') {
      const kvManager = new GitHubKVManager();
      data = await kvManager.getSettingById(id);
    } else if (type === 'ding-setting') {
      const kvManager = new DingKVManager();
      data = await kvManager.getSettingById(id);
    } else if (type === 'ding-info') {
      const kvManager = new DingKVManager();
      data = await kvManager.getDingInfo(id);
    }

    return c.html(
      ConfigurationHTML +
        `
<script type="module">
  import defaultSchema from '${schemaUrl}' assert { type: 'json' };

  window.starting_value = ${JSON.stringify(data ?? {})};
  window.submit_url = '${c.origin}configuration/${id}/${type}?token=${token}';
  window._options = {
    schema: defaultSchema,
    startval: window.starting_value,
  }
  window.parseData();
</script>`,
    );
  });
}

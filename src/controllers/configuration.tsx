import { html, raw } from 'hono/html';

import { AdminDAO } from '@/dao/admin';
import { DingDAO } from '@/dao/ding';
import { GitHubDAO } from '@/dao/github';
import {
  EValidLevel,
  LevelSettingsMap,
  SettingType,
  SettingsNameMap,
} from '@/dao/types';
import UnauthorizedHTML from '@/public/configuration/401.html';
import ConfigurationHTML from '@/public/configuration/configuration.html';
import { AdminService } from '@/services/admin';

declare module 'hono' {
  interface Context {
    validLevel: EValidLevel;
  }
}

export function route(hono: THono) {
  hono.use('/configuration/:id/*', async (c, next) => {
    const token = c.req.query('token');
    const id = c.req.param('id');

    const validLevel = await AdminService.instance().isTokenValidFor(token, id);
    if (validLevel > EValidLevel.None) {
      c.validLevel = validLevel;
      await next();
      return;
    }

    return c.html(UnauthorizedHTML, 401);
  });

  hono.get('/configuration/:id', async (c) => {
    const id = c.req.param('id');
    const token = c.req.query('token');
    const params = new URLSearchParams();
    if (token) params.append('token', token);

    const settingsTypes = LevelSettingsMap[c.validLevel];

    return c.html(
      html`<!doctype html>
        <h1>Please select an item to continue:</h1>

        ${settingsTypes.map(
          (v) =>
            html`<a href="/configuration/${id}/${v}?${params.toString()}"
                >${v}: ${SettingsNameMap[v]}</a
              ><br />`,
        )} `,
    );
  });

  hono.post('/configuration', async (c) => {
    const body = await c.req.json();
    const id = c.req.query('id');
    if (!id) {
      return c.send.error(404, 'page not found');
    }

    const token = body['token'];
    const kv = new AdminDAO();
    const validLevel = await AdminService.instance().isTokenValidFor(token, id);

    if (validLevel < EValidLevel.Admin) {
      return c.send.error(404, 'page not found');
    }

    const scopeToken = body['scopeToken'];
    if (scopeToken) {
      await kv.setScopeToken(id, scopeToken);
    }

    return c.send.message('ok');
  });

  hono.post('/configuration/:id/:type', async (c) => {
    const id = c.req.param('id');

    if (!id) {
      return c.send.error(404, 'Not Found: id in query');
    }
    const type = c.req.param('type') as SettingType;

    const settingsTypes = LevelSettingsMap[c.validLevel];

    if (!settingsTypes.includes(type as SettingType)) {
      return c.send.error(404, 'Not Found: type is not valid');
    }
    const data = await c.req.json();
    if (type === 'app-settings') {
      await GitHubDAO.instance().setAppSettingById(id, data);
    } else if (type === 'setting') {
      await GitHubDAO.instance().setSettingById(id, data);
    } else if (type === 'ding-setting') {
      await DingDAO.instance().setSettingById(id, data);
    } else if (type === 'ding-info') {
      await DingDAO.instance().setDingInfo(id, data);
    }
    return c.json({ success: true });
  });

  hono.get('/configuration/:id/:type', async (c) => {
    const id = c.req.param('id');

    const token = c.req.query('token')!;

    if (!id) {
      return c.text('Not Found: id in query', 404);
    }

    const settingsTypes = LevelSettingsMap[c.validLevel];

    const type = c.req.param('type') as SettingType;
    if (!settingsTypes.includes(type as SettingType)) {
      return c.text('Not Found:' + type, 404);
    }
    const schemaUrl = `${c.origin}/static/json-schemas/${type}`;

    let data = null;

    if (type === 'app-settings') {
      data = await GitHubDAO.instance().getAppSettingById(id);
    } else if (type === 'setting') {
      data = await GitHubDAO.instance().getSettingById(id);
    } else if (type === 'ding-setting') {
      data = await DingDAO.instance().getSettingById(id);
    } else if (type === 'ding-info') {
      data = await DingDAO.instance().getDingInfo(id);
    }

    return c.html(
      html`${raw(ConfigurationHTML)}
        <script type="module">
          const defaultSchema = await (await fetch("${schemaUrl}")).json();
          window.starting_value = ${raw(JSON.stringify(data ?? {}))};
          window.submit_url =
            "${c.origin}/configuration/${id}/${type}?token=${token}";
          window._options = {
            schema: defaultSchema,
            startval: window.starting_value,
          };
          window.parseData();
        </script>`,
    );
  });
}

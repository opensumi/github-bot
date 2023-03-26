import { Hono } from 'hono';

import AppSettings from '@/public/json-schemas/app-settings.schema.json';
import DingInfo from '@/public/json-schemas/ding-info.schema.json';
import DingSetting from '@/public/json-schemas/ding-setting.schema.json';
import Setting from '@/public/json-schemas/setting.schema.json';

const map = {
  'app-settings': AppSettings,
  'ding-info': DingInfo,
  'ding-setting': DingSetting,
  setting: Setting,
} as Record<string, object>;

export function route(hono: THono) {
  const files = new Hono();

  files.get('/json-schemas/:id', (c) => {
    const id = c.req.param('id');
    if (id in map) {
      return c.json(map[id]);
    }
    return c.text('Not Found', 404);
  });

  hono.route('/static', files);
}

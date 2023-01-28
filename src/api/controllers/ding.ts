import { DingBot, verifyMessage } from '@/ding/bot';
import { DingKVManager } from '@/ding/secrets';

export function route(hono: THono) {
  hono.post('/ding/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');

    console.log(`handler ~ id`, id);
    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const kvManager = new DingKVManager(c.env);
    const setting = await kvManager.getSettingById(id);
    if (!setting) {
      return c.send.error(400, 'id not found in database');
    }

    if (!setting.outGoingToken) {
      return c.send.error(400, 'please set webhook token in database');
    }

    const errMessage = await verifyMessage(
      c.req.headers,
      setting.outGoingToken,
    );
    if (errMessage) {
      console.log(`check sign error:`, errMessage);
      return c.send.error(403, errMessage);
    }

    const bot = new DingBot(
      id,
      await c.req.json(),
      kvManager,
      c.executionCtx,
      c.env,
      setting,
    );
    c.executionCtx.waitUntil(bot.handle());
    return c.send.message('ok');
  });
}

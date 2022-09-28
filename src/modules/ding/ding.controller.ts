import { DingBot, verifyMessage } from '@/ding/bot';
import { DingKVManager } from '@/ding/secrets';
import { BaseController } from '../base/base.controller';

export class DingController extends BaseController {
  handle() {
    // 接收 DingTalk webhook 事件
    this.hono.post('/ding/:id', async (c) => {
      const id = c.req.param('id') ?? c.req.query('id');

      console.log(`handler ~ id`, id);
      if (!id) {
        return c.error(401, 'need a valid id');
      }
      const kvManager = new DingKVManager(c.env);
      const setting = await kvManager.getSettingById(id);
      if (!setting) {
        return c.error(404, 'id not found');
      }

      if (!setting.outGoingToken) {
        return c.error(401, 'please set webhook token in bot settings');
      }

      const errMessage = await verifyMessage(
        c.req.headers,
        setting.outGoingToken,
      );
      if (errMessage) {
        console.log(`check sign error:`, errMessage);
        return c.error(403, errMessage);
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
      return c.message('ok');
    });
  }
}

import { DingDAO } from '@/dal/ding';
import { DingBotAdapter } from '@/services/dingtalk-bot';
import { Session, verifyMessage } from '@opensumi/dingtalk-bot';

export function route(hono: THono) {
  hono.post('/ding/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');

    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const kvManager = DingDAO.instance();
    const setting = await kvManager.getSettingById(id);
    if (!setting) {
      return c.send.error(
        400,
        `id not found in database: ${kvManager.secretsKV.f(id)}`,
      );
    }

    if (!setting.outGoingToken) {
      return c.send.error(
        400,
        `please set webhook token in database: ${kvManager.secretsKV.f(id)}`,
      );
    }

    const errMessage = await verifyMessage(
      c.req.raw.headers,
      setting.outGoingToken,
    );
    if (errMessage) {
      console.log(`check sign error:`, errMessage);
      return c.send.error(403, errMessage);
    }

    const bot = new DingBotAdapter(id, c, c.executionCtx, setting);
    const session = new Session(await c.req.json());

    c.executionCtx.waitUntil(bot.handle(session));

    return c.send.message('ok');
  });
}

import { Session } from '@/im/bot';
import { DingBotAdapter } from '@/im/ding/bot';
import { DingKVManager } from '@/kv/ding';
import { verifyMessage } from '@opensumi/dingtalk-bot/lib';

export function route(hono: THono) {
  hono.post('/ding/:id', async (c) => {
    const id = c.req.param('id') ?? c.req.query('id');

    if (!id) {
      return c.send.error(400, 'need a valid id');
    }
    const kvManager = new DingKVManager();
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

    const session = new Session(
      c,
      new DingBotAdapter(
        id,
        c,
        await c.req.json(),
        kvManager,
        c.executionCtx,
        setting,
      ),
    );

    session.runInBackground();

    return c.send.message('ok');
  });
}

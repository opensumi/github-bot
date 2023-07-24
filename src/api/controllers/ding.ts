import { DingBot, verifyMessage } from '@/im/bot';
import { DingKVManager } from '@/kv/ding';
import { errorCallback } from '@/utils';

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
        `please set webhook token in database:  ${kvManager.secretsKV.f(id)}`,
      );
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
      c,
      await c.req.json(),
      kvManager,
      c.executionCtx,
      setting,
    );

    c.executionCtx.waitUntil(
      errorCallback(bot.handle(), async (err: unknown) => {
        await bot.replyText(
          `处理消息出错: ${(err as Error).message} ${(err as Error).stack}`,
        );
      }),
    );
    return c.send.message('ok');
  });
}

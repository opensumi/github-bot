import { error, message } from '@/runtime/response';
import { DingKVManager } from './secrets';
import { DingBot, verifyMessage } from './bot';
import { Env } from '..';

export async function handler(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  env: Env,
  ctx: ExecutionContext,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  console.log(`handler ~ id`, id);
  if (!id) {
    return error(401, 'need a valid id');
  }

  const kvManager = new DingKVManager(env);
  const setting = await kvManager.getSettingById(id);
  if (!setting) {
    return error(404, 'id not found');
  }
  if (!setting.outGoingToken) {
    return error(401, 'please set webhook token in bot settings');
  }

  const errMessage = await verifyMessage(req, setting.outGoingToken);
  if (errMessage) {
    console.log(`check sign error:`, errMessage);
    return error(403, errMessage);
  }

  const bot = new DingBot(id, await req.json(), kvManager, ctx, env, setting);
  ctx.waitUntil(bot.handle());
  return message('ok');
}

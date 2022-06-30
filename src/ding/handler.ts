import { error, message } from '@/utils';
import { getSettingById } from './secrets';
import { DingBot } from './bot';

export async function handler(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  event: FetchEvent,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  if (!id) {
    return error(401, 'need a valid id');
  }
  const setting = await getSettingById(id);
  if (!setting) {
    return error(403, 'id not found');
  }
  if (!setting.outGoingToken) {
    return error(401, 'please set webhook token in bot settings');
  }

  const bot = new DingBot(id, req, event, setting);

  const errMessage = await bot.verify();
  if (errMessage) {
    console.log(`check sign error:`, errMessage);
    return error(403, errMessage);
  }
  event.waitUntil(bot.handle());

  return message('ok');
}

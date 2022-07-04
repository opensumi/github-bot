import { error, message } from '@/utils';
import { getSettingById } from './secrets';
import { DingBot, verifyMessage } from './bot';

export async function handler(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  event: FetchEvent,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  console.log(`handler ~ id`, id);
  if (!id) {
    return error(401, 'need a valid id');
  }
  const setting = await getSettingById(id);
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

  const bot = new DingBot(id, await req.json(), event, setting);
  event.waitUntil(bot.handle());
  return message('ok');
}

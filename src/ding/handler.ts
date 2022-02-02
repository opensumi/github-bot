import { error, message } from '../utils';
import { Message } from '.';
import { DingBot } from './bot';

export async function handler(req: Request, event: FetchEvent) {
  const errMessage = await DingBot.verify(req);
  if (errMessage) {
    console.log(`check sign error:`, errMessage);
    return error(403, errMessage);
  }

  const _msg = (await req.json()) as Message;

  const bot = new DingBot(req, _msg, event);
  await bot.handle();

  return message('ok');
}

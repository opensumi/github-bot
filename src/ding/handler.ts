import { error, text } from 'itty-router-extras';
import { isGroupMessage, Message } from './types';
import { doSign, send } from './utils';
import { commandCenter } from './command';

function validateTimestamp(timestamp: string) {
  try {
    const _tsNumber = parseInt(timestamp, 10);
    const now = Date.now();
    const diff = Math.abs(now - _tsNumber);
    if (diff <= 60 * 60 * 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * 验证接收到的钉钉消息的签名是否合法
 */
async function checkSign(req: Request): Promise<string | undefined> {
  if (!DINGTALK_OUTGOING_TOKEN) {
    return;
  }
  const headers = req.headers;
  const timestamp = headers.get('timestamp') as string;
  const sign = headers.get('sign') as string;
  // 开发者需对header中的timestamp和sign进行验证
  // 以判断是否是来自钉钉的合法请求，避免其他仿冒钉钉调用开发者的HTTPS服务传送数据，具体验证逻辑如下：
  // 1. timestamp 与系统当前时间戳如果相差1小时以上，则认为是非法的请求。
  const tsValid = validateTimestamp(timestamp);
  if (!tsValid) {
    return 'timestamp is invalid';
  }
  const calculatedSign = await doSign(
    DINGTALK_OUTGOING_TOKEN,
    timestamp + '\n' + DINGTALK_OUTGOING_TOKEN,
  );
  // 2. sign 与开发者自己计算的结果不一致，则认为是非法的请求。
  if (calculatedSign !== sign) {
    return 'sign is invalid';
  }
  return;
}
export async function handler(req: Request, event: FetchEvent) {
  const headers = req.headers;
  const timestamp = headers.get('timestamp');
  const sign = headers.get('sign');
  if (timestamp && sign) {
    const errMessage = await checkSign(req);
    if (errMessage) {
      console.log(`check sign error:`, errMessage);
      return error(403, errMessage);
    }
  } else {
    // 好像企业内部的这个机器人发的 headers 不带这俩字段了，这里的逻辑可以暂时不用了
    // return error(403, '不是有效的钉钉消息，headers 缺少字段');
  }

  const body = (await req.json()) as Message;
  console.log(`收到钉钉消息：`, JSON.stringify(body));

  if (isGroupMessage(body)) {
    await send(
      {
        msgtype: 'text',
        text: {
          content: `@${body.senderId}你好哇，我是 Sumi`,
        },
        at: {
          atDingtalkIds: [body.senderId],
        },
      },
      body.sessionWebhook,
    );
  }

  return text('ok');
}

import { error, text } from 'itty-router-extras';
import { doSign } from './utils';

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
  if (!DINGTALK_OUTGOING_SECRET) {
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
    DINGTALK_OUTGOING_SECRET,
    timestamp + '\n' + DINGTALK_OUTGOING_SECRET,
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
  if (!timestamp || !sign) {
    return error(403, '不是有效的钉钉消息，headers 缺少字段');
  }

  const errMessage = await checkSign(req);
  if (errMessage) {
    return error(403, errMessage);
  }

  return text('ok');
}

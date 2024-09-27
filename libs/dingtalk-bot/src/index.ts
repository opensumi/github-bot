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
  } catch (_err) {
    return false;
  }
}

/**
 * 验证接收到的钉钉消息的签名是否合法
 */
async function checkSign(
  timestamp: string,
  sign: string,
  token: string,
): Promise<string | undefined> {
  if (!token) {
    return;
  }

  // 开发者需对header中的timestamp和sign进行验证
  // 以判断是否是来自钉钉的合法请求，避免其他仿冒钉钉调用开发者的HTTPS服务传送数据，具体验证逻辑如下：
  // 1. timestamp 与系统当前时间戳如果相差1小时以上，则认为是非法的请求。
  const tsValid = validateTimestamp(timestamp);
  if (!tsValid) {
    return 'timestamp is invalid';
  }
  const calculatedSign = await doSign(token, timestamp + '\n' + token);
  // 2. sign 与开发者自己计算的结果不一致，则认为是非法的请求。
  if (calculatedSign !== sign) {
    return 'sign is invalid';
  }
  return;
}

export async function verifyMessage(headers: Headers, token: string) {
  console.log(`verifyMessage ~ headers`, headers);
  const timestamp = headers.get('timestamp') as string;
  const sign = headers.get('sign') as string;
  if (timestamp && sign) {
    const errMessage = await checkSign(timestamp, sign, token);
    if (errMessage) {
      return errMessage;
    }
  } else {
    // it seem that dingtalk will not send timestamp and sign in header
    // return 'not valid ding msg, missing validation field';
  }
}

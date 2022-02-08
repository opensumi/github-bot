import { doSign, Message, send } from '.';
import secrets from '@/secrets';
import { cc } from './commands';
import { compose, text as textWrapper } from './message';
import mri from 'mri';

function sanitize(s: string) {
  return s.toString().trim();
}

function parseCliArgs(command: string) {
  return mri(command.split(' '));
}

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
  if (!secrets.dingtalkOutGoingToken) {
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
    secrets.dingtalkOutGoingToken,
    timestamp + '\n' + secrets.dingtalkOutGoingToken,
  );
  // 2. sign 与开发者自己计算的结果不一致，则认为是非法的请求。
  if (calculatedSign !== sign) {
    return 'sign is invalid';
  }
  return;
}

export class DingBot {
  constructor(
    private req: Request,
    private _msg: Message,
    private event: FetchEvent,
  ) {}

  get msg(): Message {
    return this._msg;
  }

  static async verify(req: Request) {
    const headers = req.headers;
    const timestamp = headers.get('timestamp');
    const sign = headers.get('sign');
    if (timestamp && sign) {
      const errMessage = await checkSign(req);
      if (errMessage) {
        return errMessage;
      }
    } else {
      // 好像企业内部的这个机器人发的 headers 不带这俩字段了，这里的逻辑可以暂时不用了
      // return error(403, 'not valid ding msg, missing validation field');
    }
  }

  async handle() {
    const msg = this.msg;
    console.log(`recieve dingtalk msg: `, JSON.stringify(msg, null, 2));
    // 其实目前钉钉机器人也就支持这一种消息类型
    if (msg.msgtype === 'text') {
      const text = sanitize(msg.text.content);
      const parsed = parseCliArgs(text);

      const handler = await cc.resolve(text);
      if (handler) {
        await handler(this, {
          message: msg,
          command: text,
          parsed,
        });
      } else {
        console.log('没有 handler 处理 ', text);
      }
    }
  }

  async replyText(text: string, contentExtra: Record<string, any> = {}) {
    await this.reply(compose(textWrapper(text), contentExtra));
  }

  async reply(content: Record<string, any>) {
    console.log(`DingBot ~ reply:`, JSON.stringify(content));
    const msg = this.msg;
    await send(content, msg.sessionWebhook);
  }
}

import { doSign, Message, send } from '.';
import { IDingBotSetting } from './secrets';
import { cc } from './commands';
import { compose, text as textWrapper } from './message';
import mri from 'mri';
import { getAppSettingById } from '@/github/storage';
import { initApp } from '@/github/app';
import { App } from '@/lib/octo';

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
async function checkSign(
  req: Request,
  token: string,
): Promise<string | undefined> {
  if (!token) {
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
  const calculatedSign = await doSign(token, timestamp + '\n' + token);
  // 2. sign 与开发者自己计算的结果不一致，则认为是非法的请求。
  if (calculatedSign !== sign) {
    return 'sign is invalid';
  }
  return;
}

export class DingBot {
  _msg!: Message;
  constructor(
    public id: string,
    private req: Request,
    private event: FetchEvent,
    private setting: IDingBotSetting,
  ) {}

  get msg(): Message {
    return this._msg;
  }

  async verify() {
    const req = this.req;
    const headers = req.headers;
    const timestamp = headers.get('timestamp');
    const sign = headers.get('sign');
    if (timestamp && sign) {
      const errMessage = await checkSign(req, this.setting.outGoingToken);
      if (errMessage) {
        return errMessage;
      }
    } else {
      // 好像企业内部的这个机器人发的 headers 不带这俩字段了，这里的逻辑可以暂时不用了
      // return error(403, 'not valid ding msg, missing validation field');
    }
  }

  async handle() {
    this._msg = (await this.req.json()) as Message;
    const msg = this._msg;
    console.log(`receive dingtalk msg: `, JSON.stringify(msg, null, 2));

    let app: App<any> | undefined;
    const setting = await getAppSettingById(this.id);
    if (setting) {
      console.log('has github app settings');
      app = await initApp(setting, this.event);
      console.log('init app success');
    }

    // 其实目前钉钉机器人也就支持这一种消息类型
    if (msg.msgtype === 'text') {
      const text = sanitize(msg.text.content);
      console.log(`DingBot ~ handle ~ text`, text);
      const parsed = parseCliArgs(text);
      console.log(`DingBot ~ handle ~ parsed`, parsed);

      const handler = await cc.resolve(text);
      if (handler) {
        await handler(this, {
          message: msg,
          command: text,
          parsed,
          app,
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

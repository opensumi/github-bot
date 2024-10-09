import { Message, SendMessage, compose, text as textFn } from '../types';
import { send } from '../utils';

function prepare(s: string) {
  return s.toString().trim();
}

export class Session {
  constructor(public msg: Message) {}

  async replyText(text: string, contentExtra: Record<string, any> = {}) {
    await this.reply(compose(textFn(text), contentExtra));
  }

  async reply(content: SendMessage) {
    console.log(`DingBot ~ reply:`, JSON.stringify(content));
    await send(content, this.msg.sessionWebhook);
  }

  get text() {
    return prepare(this.msg.text.content);
  }
}

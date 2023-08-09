import throttle from 'lodash/throttle';

import { Conversation } from '@/ai/conversation';
import { Context } from '@/im/commands';
import { markdown } from '@/im/message';

import { IBotAdapter } from './types';

export class OpenAI {
  constructor(
    protected text: string,
    protected bot: IBotAdapter,
    protected ctx: Context,
  ) {}

  async getReplyText(): Promise<string | undefined> {
    const conversation = new Conversation(this.text, this.bot, this.ctx);

    let triggerTimes = 0;
    const throttleWait =
      await conversation.conversationKVManager.getThrottleWait();

    const timeSpend = Math.floor(triggerTimes * throttleWait);

    const onProgress = throttle((data) => {
      triggerTimes++;
      if (data.text) {
        this.bot.replyText(
          `ChatGPT ${
            timeSpend > 40 ? '仍' : timeSpend > 20 ? '还' : '正'
          }在输入中。Length: ` +
            data.text.length +
            ', 时间花费: ' +
            timeSpend +
            's',
        );
      }
    }, throttleWait * 1000);

    const text = await conversation.reply2({
      onProgress: throttleWait > 0 ? onProgress : undefined,
    });

    onProgress.cancel();
    return text;
  }

  async reply(text: string): Promise<void> {
    await this.bot.reply(
      markdown(
        text.slice(0, 30),
        `${text.trim()}\n\n> Powered By OpenAI gpt-3.5-turbo`,
      ),
    );
  }
}

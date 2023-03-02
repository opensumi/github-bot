import throttle from 'lodash/throttle';

import { Conversation } from '@/ai/conversation';
import { ECompletionModel } from '@/ai/openai/shared';
import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import { markdown } from '@/ding/message';

export interface IOpenAIResponse {
  type: 'gpt3' | 'chatgpt';
  text: string | undefined;
}

export class OpenAI {
  model = ECompletionModel.GPT3;

  constructor(protected bot: DingBot, protected ctx: Context) {}

  async getReplyText(): Promise<IOpenAIResponse> {
    const conversation = new Conversation(this.bot, this.ctx);

    let triggerTimes = 0;
    const throttleWait = 5000;
    const onProgress = throttle((data) => {
      triggerTimes++;
      if (data.text) {
        this.bot.replyText(
          `ChatGPT ${
            triggerTimes > 10 ? '仍' : triggerTimes > 5 ? '还' : '正'
          }在输入中。Length: ` +
            data.text.length +
            ', 时间花费: ' +
            Math.floor(triggerTimes * throttleWait) +
            'ms',
        );
      }
    }, throttleWait);

    const text = await conversation.reply2({
      onProgress,
    });

    onProgress.cancel();
    return {
      type: 'chatgpt',
      text,
    };
  }

  async reply(response: IOpenAIResponse): Promise<void> {
    if (response.text) {
      const text = response.text;
      const powerBy = response.type === 'gpt3' ? 'GPT-3' : 'ChatGPT';
      await this.bot.reply(
        markdown(
          text.slice(0, 30),
          `${text.trim()}\n\n> Powered By OpenAI ${powerBy}`,
        ),
      );
    }
  }
}

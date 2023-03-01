import { OpenAIClient, CompletionParams } from '@bytemain/openai-fetch';
import throttle from 'lodash/throttle';

import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import { markdown } from '@/ding/message';
import { standardizeMarkdown } from '@/github/utils';

import { Conversation } from '../conversation';

import { ECompletionModel } from './shared';

export interface IOpenAIResponse {
  type: 'gpt3' | 'chatgpt';
  text: string | undefined;
}

export class OpenAI {
  openai: OpenAIClient;
  model = ECompletionModel.GPT3;

  constructor(protected bot: DingBot, protected ctx: Context) {
    this.openai = new OpenAIClient({
      apiKey: bot.env.OPENAI_API_KEY,
      options: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        credentials: undefined,
      },
    });
  }

  async getReplyText(): Promise<IOpenAIResponse> {
    const conversation = new Conversation(this.bot, this.ctx, this);
    let costTime = 0;
    const throttleWait = 5000;
    const onProgress = throttle((data) => {
      costTime += throttleWait;
      if (data.text) {
        this.bot.replyText(
          'ChatGPT is typing... Current Length: ' +
            data.text.length +
            ', Cost Time: ' +
            costTime +
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

  async createCompletion(
    prompt: string,
    options?: {
      stop?: string | string[];
      max_tokens?: number;
    },
  ): Promise<string | undefined> {
    const model =
      await this.bot.conversationKVManager.getConversationPreferredModel();

    const params = {
      model: model,
      prompt: prompt,
      temperature: 0.8,
      top_p: 1.0,
      presence_penalty: 1.0,
      frequency_penalty: 0.5,
      max_tokens: options?.max_tokens || 1024,
    } as CompletionParams;
    if (options?.stop) {
      params.stop = options.stop;
    }
    const response = await this.openai.createCompletion(params);
    const text = response.completion;

    return text;
  }

  async reply(response: IOpenAIResponse): Promise<void> {
    if (response.text) {
      const text = response.text;
      const powerBy = response.type === 'gpt3' ? 'GPT-3' : 'ChatGPT';
      await this.bot.reply(
        markdown(
          text.slice(0, 30),
          `${standardizeMarkdown(
            text.trim(),
          )}\n\n> Powered By OpenAI ${powerBy}`,
        ),
      );
    }
  }
}

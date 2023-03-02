import { OpenAIClient, CompletionParams } from '@bytemain/openai-fetch';

import { EMessageRole, IConversationData } from '@/ai/conversation/types';
import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import { Message } from '@/ding/types';
import Environment from '@/env';
import { DingConversation, KVManager } from '@/kv';
import { StringBuilder } from '@/utils';

import { ECompletionModel } from '../shared';

import { ConversationHistory } from './history';
export const STOP_KEYWORD = '';

export class OpenAI {
  openai: OpenAIClient;
  model = ECompletionModel.GPT3;
  dataKV: KVManager<IConversationData>;
  id: string;
  currentRoundPrompt: string;

  constructor(
    private message: Message,
    protected bot: DingBot,
    protected ctx: Context,
  ) {
    this.id = message.conversationId;
    this.currentRoundPrompt = ctx.command;

    this.openai = new OpenAIClient({
      apiKey: Environment.instance().OPENAI_API_KEY,
      options: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        credentials: undefined,
      },
    });
    this.dataKV = KVManager.for(DingConversation.DATA_PREFIX);
  }

  async getConversation() {
    const data = await this.dataKV.getJSON(this.id);
    return new ConversationHistory(data ?? { data: [] }, this.dataKV, this.id);
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

  clearConversation = async () => {
    await this.dataKV.delete(this.id);
  };
  async reply() {
    const currentDate = new Date().toISOString().split('T')[0];

    const history = await this.getConversation();
    await history.recordHuman(this.currentRoundPrompt);

    const builder = new StringBuilder();
    builder.add(
      `Instructions:\nYou are ${EMessageRole.AI}, a large language model trained by OpenAI.
      Current date: ${currentDate}${STOP_KEYWORD}\n\n`,
    );
    builder.add(`${EMessageRole.AI} 和 ${EMessageRole.Human} 使用中文交流。\n`);
    builder.addLineIfNecessary();

    if (history) {
      const data = history.data;
      for (const item of data) {
        builder.add(`${item.type}: ${item.str}${STOP_KEYWORD}`);
      }
    }
    builder.add(
      `${EMessageRole.Human}: ${this.currentRoundPrompt}${STOP_KEYWORD}`,
    );
    builder.add(`${EMessageRole.AI}:${STOP_KEYWORD}`);

    const prompt = builder.toString();

    const text = await this.createCompletion(prompt, {});

    if (text) {
      await history.recordAI(text);
      return text;
    }
  }
}

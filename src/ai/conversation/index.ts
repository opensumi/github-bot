import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import { encode as gpt3Encode } from '@/lib/GPT-3-Encoder';
import { StringBuilder } from '@/utils';

import { OpenAI } from '../openai';

import { ConversationKVManager, EMessageRole } from './kvManager';
export const STOP_KEYWORD = '<|endoftext|>';

export class Conversation {
  conversationId: string;
  conversationKVManager: ConversationKVManager;

  currentRoundPrompt: string;

  constructor(bot: DingBot, ctx: Context, protected openai: OpenAI) {
    this.conversationId = bot.msg.conversationId;
    this.conversationKVManager = bot.conversationKVManager;

    this.currentRoundPrompt = ctx.command;
  }

  _maxModelTokens = 4096;
  _maxResponseTokens = 1000;

  async reply() {
    const currentDate = new Date().toISOString().split('T')[0];

    const history = await this.conversationKVManager.getConversation();
    const builder = new StringBuilder();
    builder.add(
      `Instructions:\nYou are ${EMessageRole.AI}, a large language model trained by OpenAI.
      Current date: ${currentDate}${STOP_KEYWORD}\n\n`
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

    const numTokens = this._getTokenCount(prompt);

    // Use up to 4096 tokens (prompt + response), but try to leave 1000 tokens
    // for the response.
    const maxTokens = Math.max(
      1,
      Math.min(this._maxModelTokens - numTokens, this._maxResponseTokens),
    );

    const text = await this.openai.createCompletion(prompt, {
      stop: STOP_KEYWORD,
      max_tokens: maxTokens,
    });

    if (text) {
      this.conversationKVManager.record(this.currentRoundPrompt, text, history);
      return text;
    } else {
      this.conversationKVManager.recordHuman(this.currentRoundPrompt, history);
    }
  }

  protected _getTokenCount(text: string) {
    return gpt3Encode(text).length;
  }
}

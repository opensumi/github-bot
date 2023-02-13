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
      `你是一个 AI，The AI is designed to respond to user input in a conversational manner, Answer as concisely as possible. AI's training data comes from a diverse range of internet text and AI have been trained to generate human-like responses to various questions and prompts. AI can provide information on a wide range of topics, but AI's knowledge is limited to what was present in AI's training data, which has a cutoff date of 2021. AI strive to provide accurate and helpful information to the best of AI's ability.\nKnowledge cutoff: 2021-09`,
    );
    builder.add(`Current date: ${currentDate}\n\n`);
    builder.add(
      `以下是人类与AI的对话。该AI非常有帮助、富有创造力、聪明、且非常友好。`,
    );
    builder.addLineIfNecessary();
    builder.add(`${EMessageRole.Human}: Hello, who are you?${STOP_KEYWORD}`);
    builder.add(
      `${EMessageRole.AI}: I am an AI. How can I help you today?${STOP_KEYWORD}`,
    );

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

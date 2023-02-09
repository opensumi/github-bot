import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import { StringBuilder } from '@/utils';

import { OpenAI } from '../openai';

import { ConversationKVManager } from './kvManager';

export class Conversation {
  conversationId: string;
  conversationKVManager: ConversationKVManager;

  currentRoundPrompt: string;

  constructor(bot: DingBot, ctx: Context, protected openai: OpenAI) {
    this.conversationId = bot.msg.conversationId;
    this.conversationKVManager = bot.conversationKVManager;

    this.currentRoundPrompt = ctx.command;
  }

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
    builder.add('人类: Hello, who are you?');
    builder.add('AI: I am an AI. How can I help you today?');

    if (history) {
      const data = history.data;
      for (const item of data) {
        builder.add(`${item.type}: ${item.str}`);
      }
    }

    builder.add(`人类: ${this.currentRoundPrompt}`);
    builder.add('AI:');

    const prompt = builder.toString();
    const text = await this.openai.createCompletion(prompt, {
      stop: 'AI:',
    });

    if (text) {
      this.conversationKVManager.record(this.currentRoundPrompt, text, history);
      await this.openai.reply(text);
    } else {
      this.conversationKVManager.recordHuman(this.currentRoundPrompt, history);
    }
  }
}

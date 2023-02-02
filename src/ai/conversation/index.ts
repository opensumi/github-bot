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
    const history = await this.conversationKVManager.getConversation();
    const builder = new StringBuilder();
    builder.add(
      `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.`,
    );
    builder.addLineIfNecessary();
    builder.add('Human: Hello, who are you?');
    builder.add('AI: I am an AI. How can I help you today?');

    if (history) {
      const data = history.data;
      for (const item of data) {
        builder.add(`${item.type}: ${item.str}`);
      }
    }

    builder.add(`Human: ${this.currentRoundPrompt}`);
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

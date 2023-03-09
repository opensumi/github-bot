import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import Environment from '@/env';

import { ChatGPTAPI } from '../openai/chatgpt';
import {
  ChatMessage,
  SendMessageBrowserOptions,
} from '../openai/chatgpt/types';

import { ConversationKVManager } from './kvManager';

export class Conversation {
  conversationId: string;
  conversationKVManager: ConversationKVManager;

  currentRoundPrompt: string;

  constructor(protected bot: DingBot, protected ctx: Context) {
    this.conversationId = bot.msg.conversationId;
    this.conversationKVManager = bot.conversationKVManager;

    this.currentRoundPrompt = ctx.command;
  }

  async reply2(options?: { onProgress?: (data: ChatMessage) => void }) {
    if (!Environment.instance().OPENAI_ACCESS_TOKEN) {
      return 'OpenAI access token is not set';
    }

    const kvManager = await this.conversationKVManager;
    const api = new ChatGPTAPI({
      apiKey: Environment.instance().OPENAI_API_KEY!,
      debug: true,
      messageStore: {
        get(key) {
          return kvManager.getMessage(key);
        },
        async set(key, message) {
          await kvManager.setMessage(key, message);
        },
      },
    });
    const lastMessageId = await kvManager.getLastMessageId();
    const messageOptions = {
      parentMessageId: lastMessageId,
      conversationId: this.conversationId,
      onProgress: options?.onProgress,
    } as SendMessageBrowserOptions;

    const message = await api.sendMessage(
      this.currentRoundPrompt,
      messageOptions,
    );
    await this.conversationKVManager.setLastMessage(message);
    if (message.text) {
      return message.text;
    }
  }
}

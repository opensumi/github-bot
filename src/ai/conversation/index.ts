import { ChatGPTAPI, ChatMessage, SendMessageBrowserOptions } from 'chatgpt';

import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import Environment from '@/env';

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
      async upsertMessage(message: ChatMessage) {
        await kvManager.setMessage(message.id, message);
      },
      async getMessageById(key: string): Promise<ChatMessage> {
        return (await kvManager.getMessage(key)) as ChatMessage;
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

import { DingBot } from '@/ding/bot';
import { Context } from '@/ding/commands';
import Environment from '@/env';

import {
  ChatMessage,
  SendMessageBrowserOptions,
} from '../openai/chatgpt/types';
import { ChatGPTUnofficialProxyAPI } from '../openai/chatgpt/unofficial';

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

    const history = await this.conversationKVManager.getMessageHistory();
    const lastMessage = history.lastMessage;
    const api = new ChatGPTUnofficialProxyAPI({
      apiReverseProxyUrl: this.conversationKVManager.getApiReverseProxyUrl(),
      debug: true,
      accessToken: Environment.instance().OPENAI_ACCESS_TOKEN!,
    });
    const messageOptions = {
      parentMessageId: lastMessage?.parentMessageId,
      conversationId: lastMessage?.conversationId,
      onProgress: options?.onProgress,
    } as SendMessageBrowserOptions;
    const message = await api.sendMessage(
      this.currentRoundPrompt,
      messageOptions,
    );
    await history.recordChat(message);
    if (message.text) {
      return message.text;
    }
  }
}

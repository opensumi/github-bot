import { Message } from '@/ding/types';
import { KVManager, DingConversation } from '@/kv';

import { ChatMessage } from '../openai/chatgpt/types';
import { ECompletionModel } from '../openai/shared';

import { IConversationSetting } from './types';

export class ConversationKVManager {
  settingsKV: KVManager<IConversationSetting>;
  id: string;
  messageKV: KVManager<ChatMessage>;
  lastMessageKV: KVManager<string>;

  constructor(private message: Message) {
    this.id = message.conversationId;

    this.settingsKV = KVManager.for(DingConversation.SETTINGS_PREFIX);
    this.lastMessageKV = KVManager.for(DingConversation.LAST_MESSAGE_PREFIX);
    this.messageKV = KVManager.for(
      `${DingConversation.MESSAGE_PREFIX}${this.id}/`,
    );
  }
  setPreferredConversationModel = async (model: ECompletionModel) => {
    return await this.settingsKV.updateJSON(this.id, {
      preferredModel: model,
    });
  };
  getConversationPreferredModel = async () => {
    const setting = await this.settingsKV.getJSON(this.id);
    return setting?.preferredModel ?? ECompletionModel.GPT3;
  };
  getThrottleWait = async () => {
    const setting = await this.settingsKV.getJSON(this.id);
    return setting?.throttleWait ?? 10;
  };
  setThrottleWait = async (num: number) => {
    return await this.settingsKV.updateJSON(this.id, {
      throttleWait: num,
    });
  };
  async getLastMessageId() {
    return await this.lastMessageKV.get(this.id);
  }
  async setLastMessage(message: ChatMessage) {
    return await this.lastMessageKV.set(this.id, message.id);
  }

  async getMessage(parentMessageId: string) {
    return await this.messageKV.getJSON(parentMessageId);
  }
  async setMessage(messageId: string, message: ChatMessage) {
    return await this.messageKV.setJSON(messageId, message);
  }

  clearConversation = async () => {
    await this.messageKV.delete(this.id);
  };
}

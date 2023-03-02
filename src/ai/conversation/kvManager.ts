import { Message } from '@/ding/types';
import Environment from '@/env';
import { KVManager, DingConversation } from '@/kv';
import { randomChoice } from '@/utils';

import { ChatMessage } from '../openai/chatgpt/types';
import { ECompletionModel } from '../openai/shared';

import { ChatMessageHistory } from './messageHistory';
import { IConversationSetting } from './types';

export class ConversationKVManager {
  settingsKV: KVManager<IConversationSetting>;
  id: string;
  messageKV: KVManager<ChatMessage[]>;

  constructor(private message: Message) {
    this.id = message.conversationId;

    this.settingsKV = KVManager.for(DingConversation.SETTINGS_PREFIX);
    this.messageKV = KVManager.for(DingConversation.MESSAGE_PREFIX);
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

  getApiReverseProxyUrl() {
    const defaultUrls = [
      'https://gpt.pawan.krd/backend-api/conversation',
      'https://chat.duti.tech/api/conversation',
    ];
    return (
      Environment.instance().CHATGPT_API_REVERSE_PROXY_URL ??
      randomChoice(defaultUrls)
    );
  }

  getMessageHistory = async (): Promise<ChatMessageHistory> => {
    const msgs = (await this.messageKV.getJSON(this.id)) ?? [];
    const history = new ChatMessageHistory(msgs, this.messageKV, this.id);

    return history;
  };

  clearConversation = async () => {
    await this.messageKV.delete(this.id);
  };
}

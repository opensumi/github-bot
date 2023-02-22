import { Message } from '@/ding/types';
import Environment from '@/env';
import { KVManager } from '@/runtime/cfworker/kv';
import { randomChoice } from '@/utils';

import { ChatMessage } from '../openai/chatgpt/types';
import { ECompletionModel } from '../openai/shared';

import { ConversationHistory } from './history';
import { ChatMessageHistory } from './messageHistory';
import { IConversationData, IConversationSetting } from './types';

const SETTINGS_PREFIX = 'ding/conversation/settings/';
const DATA_PREFIX = 'ding/conversation/data/';
const MESSAGE_PREFIX = 'ding/conversation/message/';

export class ConversationKVManager {
  kv: KVNamespace;
  settingsKV: KVManager<IConversationSetting>;
  dataKV: KVManager<IConversationData>;
  id: string;
  messageKV: KVManager<ChatMessage[]>;

  constructor(private message: Message) {
    this.id = message.conversationId;

    this.kv = Environment.instance().KV_PROD;
    this.settingsKV = new KVManager(SETTINGS_PREFIX);
    this.dataKV = new KVManager(DATA_PREFIX);
    this.messageKV = new KVManager(MESSAGE_PREFIX);
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

  async getApiReverseProxyUrl() {
    const setting = await this.settingsKV.getJSON(this.id);
    const defaultUrls = [
      // 'https://gpt.pawan.krd/backend-api/conversation',
      'https://chat.duti.tech/api/conversation',
    ];
    return setting?.apiReverseProxyUrl ?? randomChoice(defaultUrls);
  }

  getMessageHistory = async (): Promise<ChatMessageHistory> => {
    const msgs = (await this.messageKV.getJSON(this.id)) ?? [];
    const history = new ChatMessageHistory(msgs, this.messageKV, this.id);

    return history;
  };

  clearConversation = async () => {
    await this.dataKV.delete(this.id);
    await this.messageKV.delete(this.id);
  };

  async getConversation() {
    const data = await this.dataKV.getJSON(this.id);
    return new ConversationHistory(data ?? { data: [] }, this.dataKV, this.id);
  }
}

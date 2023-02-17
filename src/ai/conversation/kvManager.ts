import { Message } from '@/ding/types';
import Environment from '@/env';
import { KVManager } from '@/runtime/cfworker/kv';

import { ECompletionModel } from '../openai/shared';

import { ConversationHistory } from './history';
import { IConversationData, IConversationSetting } from './types';

const SETTINGS_PREFIX = 'ding/conversation/settings/';
const DATA_PREFIX = 'ding/conversation/data/';

export class ConversationKVManager {
  kv: KVNamespace;
  settingsKV: KVManager<IConversationSetting>;
  dataKV: KVManager<IConversationData>;
  id: string;

  constructor(private message: Message) {
    this.id = message.conversationId;

    this.kv = Environment.instance().KV_PROD;
    this.settingsKV = new KVManager(SETTINGS_PREFIX);
    this.dataKV = new KVManager(DATA_PREFIX);
  }
  toggleConversation = async (enable: boolean) => {
    return await this.settingsKV.updateJSON(this.id, {
      enableConversation: enable,
    });
  };
  setPreferredConversationModel = async (model: ECompletionModel) => {
    return await this.settingsKV.updateJSON(this.id, {
      preferredModel: model,
    });
  };
  getConversationModeEnabled = async () => {
    const setting = await this.settingsKV.getJSON(this.id);
    return setting?.enableConversation ?? false;
  };
  getConversationPreferredModel = async () => {
    const setting = await this.settingsKV.getJSON(this.id);
    return setting?.preferredModel ?? ECompletionModel.GPT3;
  };

  clearConversation = async () => {
    return await this.dataKV.delete(this.id);
  };

  async getConversation() {
    const data = await this.dataKV.getJSON(this.id);
    return new ConversationHistory(data ?? { data: [] }, this.dataKV, this.id);
  }
}

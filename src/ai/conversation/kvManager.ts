import { Message } from '@/ding/types';
import Environment from '@/env';
import { KVManager } from '@/runtime/cfworker/kv';

import { ECompletionModel } from '../openai/shared';

export interface IConversationSetting {
  enableConversation?: boolean;
  preferredModel?: ECompletionModel;
}

export const enum EMessageRole {
  Human = '人类',
  AI = 'AI',
}

export interface IConversationData {
  data: { type: EMessageRole; str: string }[];
}

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
    return data ?? { data: [] };
  }

  recordHuman = async (humanText: string, history: IConversationData) => {
    await this.dataKV.setJSON(this.id, {
      data: [
        ...history.data,
        {
          type: EMessageRole.Human,
          str: humanText.trim(),
        },
      ],
    });
  };

  record = async (
    humanText: string,
    AIText: string,
    history: IConversationData,
  ) => {
    await this.dataKV.setJSON(this.id, {
      data: [
        ...history.data,
        {
          type: EMessageRole.Human,
          str: humanText.trim(),
        },
        {
          type: EMessageRole.AI,
          str: AIText.trim(),
        },
      ],
    });
  };
}

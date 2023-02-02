import { Message } from '@/ding/types';
import { KVManager } from '@/runtime/cfworker/kv';

export interface IConversationSetting {
  enableConversation?: boolean;
}

export interface IConversationData {
  data: { type: 'AI' | 'Human'; str: string; time: number }[];
}

const SETTINGS_PREFIX = 'ding/conversation/settings/';
const DATA_PREFIX = 'ding/conversation/data/';

export class ConversationKVManager {
  kv: KVNamespace;
  settingsKV: KVManager<IConversationSetting>;
  dataKV: KVManager<IConversationData>;
  id: string;

  constructor(private message: Message, private env: Env) {
    this.id = message.conversationId;

    this.kv = env.KV_PROD;
    this.settingsKV = new KVManager(this.kv, SETTINGS_PREFIX);
    this.dataKV = new KVManager(this.kv, DATA_PREFIX);
  }

  toggleConversation = async (enable: boolean) => {
    return await this.settingsKV.updateJSON(this.id, {
      enableConversation: enable,
    });
  };

  getConversationModeEnabled = async () => {
    const setting = await this.settingsKV.getJSON(this.id);
    return setting?.enableConversation ?? false;
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
          type: 'Human',
          str: humanText.trim(),
          time: Date.now(),
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
          type: 'Human',
          str: humanText.trim(),
          time: Date.now(),
        },
        {
          type: 'AI',
          str: AIText.trim(),
          time: Date.now(),
        },
      ],
    });
  };
}

import { KVManager } from '@/kv';

import {
  EMessageRole,
  IConversationData,
  IConversationHistoryItem,
} from '../../conversation/types';

export class ConversationHistory {
  data: IConversationHistoryItem[];
  constructor(
    data: IConversationData,
    private dataKV: KVManager<IConversationData>,
    private id: string,
  ) {
    this.data = data.data;
  }

  async save() {
    await this.dataKV.setJSON(this.id, {
      data: this.data,
    });
  }

  recordHuman = async (humanText: string) => {
    this.data = [
      ...this.data,
      {
        type: EMessageRole.Human,
        str: humanText.trim(),
      },
    ];
    await this.save();
  };

  recordAI = async (AIText: string) => {
    this.data = [
      ...this.data,
      {
        type: EMessageRole.AI,
        str: AIText.trim(),
      },
    ];
    await this.save();
  };
}

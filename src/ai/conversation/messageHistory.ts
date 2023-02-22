import { KVManager } from '@/runtime/cfworker/kv';

import { ChatMessage } from '../openai/chatgpt/types';

export class ChatMessageHistory {
  constructor(
    private data: ChatMessage[],
    private messageKV: KVManager<ChatMessage[]>,
    private id: string,
  ) {}
  async save() {
    await this.messageKV.setJSON(this.id, this.data);
  }
  recordChat = async (message: ChatMessage) => {
    this.data = [...this.data, message];
    await this.save();
  };
  get lastMessage() {
    const lastMessage = this.data[this.data.length - 1] ?? {};
    return lastMessage;
  }
}

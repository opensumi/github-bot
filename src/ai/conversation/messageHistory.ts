import { KVManager } from '@/runtime/kv';

import { ChatMessage } from '../openai/chatgpt/types';

export class ChatMessageHistory {
  constructor(
    private data: Partial<ChatMessage>[],
    private messageKV: KVManager<Partial<ChatMessage>[]>,
    private id: string,
  ) {}
  async save() {
    await this.messageKV.setJSON(this.id, this.data);
  }
  recordChat = async (message: Partial<ChatMessage>) => {
    this.data = [
      ...this.data,
      {
        conversationId: message.conversationId,
        id: message.id,
        parentMessageId: message.parentMessageId,
        role: message.role,
      },
    ];
    await this.save();
  };
  get lastMessage() {
    const lastMessage = this.data[this.data.length - 1] ?? {};
    return lastMessage;
  }
}

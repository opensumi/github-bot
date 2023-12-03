import type { ConversationKVManager } from '@/ai/conversation/kvManager';
import type { DingKVManager } from '@/kv/ding';
import { SendMessage } from '@opensumi/dingtalk-bot/lib/types';

export interface IBotAdapter {
  id: string;
  kvManager: DingKVManager;
  conversationKVManager: ConversationKVManager;

  replyText(text: string, contentExtra?: Record<string, any>): Promise<void>;
  reply(content: SendMessage): Promise<void>;
  getProxiedUrl(url: string): string;

  handle(): Promise<void>;
}

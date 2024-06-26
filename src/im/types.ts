import type { ConversationKVManager } from '@/ai/conversation/kvManager';
import type { DingKVManager, DingUserKVManager } from '@/kv/ding';
import { SendMessage, Message } from '@opensumi/dingtalk-bot/lib/types';

export interface IBotAdapter {
  id: string;
  kvManager: DingKVManager;
  userInfoKVManager: DingUserKVManager;
  conversationKVManager: ConversationKVManager;
  msg: Message;

  replyText(text: string, contentExtra?: Record<string, any>): Promise<void>;
  reply(content: SendMessage): Promise<void>;

  handle(): Promise<void>;
}

import type { DingKVManager, DingUserKVManager } from '@/kv/ding';

export interface IBotAdapter {
  id: string;

  kvManager: DingKVManager;
  userInfoKVManager: DingUserKVManager;
}

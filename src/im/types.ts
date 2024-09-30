import type { DingKVManager, DingUserKVManager } from '@/kv/ding';
import { IBotAdapter as _IBotAdapter } from '@opensumi/dingtalk-bot/lib/bot/adapter';

export interface IBotAdapter extends _IBotAdapter {
  kvManager: DingKVManager;
  userInfoKVManager: DingUserKVManager;
}

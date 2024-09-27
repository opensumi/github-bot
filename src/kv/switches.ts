import { Common, KVManager, MemoizeFn } from '.';

interface SwitchesItem {
  enabled: boolean;
  allowlist: string[];
  denylist: string[];
  description: string;
}

export const KnownSwitches = {
  enableQueue: 'cfworker_enableQueue',
};

export class Switches {
  private switchesKV: KVManager<SwitchesItem>;

  private constructor() {
    this.switchesKV = KVManager.for<SwitchesItem>(
      Common.SWITCHES_PREFIX,
      30 * 1000,
    );
  }

  isEnableFor = async (key: string, id: string) => {
    const item = await this.switchesKV.getJSONCached(key);
    if (!item) {
      return false;
    }

    if (!item.enabled) {
      return false;
    }

    if (item.allowlist) {
      return item.allowlist.includes(id);
    }

    if (item.denylist) {
      return !item.denylist.includes(id);
    }

    return true;
  };

  private static _instance: Switches | undefined;
  static instance() {
    if (!this._instance) {
      this._instance = new Switches();
    }

    return this._instance;
  }
}

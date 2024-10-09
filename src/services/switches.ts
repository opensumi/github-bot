import { Common } from '../dao/constants';
import { KVManager } from '../dao/kv';

interface SwitchesItem {
  enabled: boolean;
  allowlist: string[];
  denylist: string[];
  description: string;
}

export const KnownSwitches = {
  EnableQueue: 'cfworker_enableQueue',
};

export class SwitchesService {
  private switchesKV: KVManager<SwitchesItem>;

  private constructor() {
    this.switchesKV = KVManager.for<SwitchesItem>(
      Common.SWITCHES_PREFIX,
      30 * 1000,
    );
  }

  protected isEnableFor = async (key: string, id: string) => {
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

  isEnableQueue = async (id: string) => {
    return this.isEnableFor(KnownSwitches.EnableQueue, id);
  };

  private static _instance: SwitchesService | undefined;
  static instance() {
    if (!this._instance) {
      this._instance = new SwitchesService();
    }

    return this._instance;
  }
}

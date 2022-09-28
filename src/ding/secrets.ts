import { KVManager } from '@/runtime/cfworker/kv';
import { Env } from '@/env';

export interface IDingBotSetting {
  outGoingToken: string;
}

export interface IDingInfo {
  defaultRepo?: string;
}

const SECRETS_PREFIX = 'ding/secrets/';
const INFO_PREFIX = 'ding/info/';

export class DingKVManager {
  kv: KVNamespace;
  secretsKV: KVManager<IDingBotSetting>;
  infoKV: KVManager<IDingInfo>;

  constructor(private env: Env) {
    this.kv = env.KV_PROD;
    this.secretsKV = new KVManager(this.kv, SECRETS_PREFIX);
    this.infoKV = new KVManager(this.kv, INFO_PREFIX);
  }

  getSettingById = async (id: string) => {
    return await this.secretsKV.getJSON(id);
  };

  getGroupInfo = async (id: string) => {
    return await this.infoKV.getJSON(id);
  };

  setGroupInfo = async (id: string, info: IDingInfo) => {
    return await this.infoKV.setJSON(id, info);
  };

  updateGroupInfo = async (id: string, info: Partial<IDingInfo>) => {
    return await this.infoKV.updateJSON(id, info);
  };

  getDefaultRepo = async (id: string) => {
    const info = await this.getGroupInfo(id);
    if (info?.defaultRepo) {
      const data = info.defaultRepo.split('/');
      return {
        owner: data[0],
        repo: data[1],
      };
    }
    return undefined;
  };
}

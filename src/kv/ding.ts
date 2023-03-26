import { KVManager, DingCommon } from '@/kv';

import { IDingBotSetting, IDingInfo } from './types';

export class DingKVManager {
  secretsKV: KVManager<IDingBotSetting>;
  infoKV: KVManager<IDingInfo>;

  constructor() {
    this.secretsKV = KVManager.for(DingCommon.SECRETS_PREFIX);
    this.infoKV = KVManager.for(DingCommon.INFO_PREFIX);
  }

  getSettingById = async (id: string) => {
    return await this.secretsKV.getJSON(id);
  };

  setSettingById = async (id: string, data: IDingBotSetting) => {
    return await this.secretsKV.setJSON(id, data);
  };

  getDingInfo = async (id: string) => {
    return await this.infoKV.getJSON(id);
  };

  setDingInfo = async (id: string, data: IDingInfo) => {
    return await this.infoKV.setJSON(id, data);
  };

  setGroupInfo = async (id: string, info: IDingInfo) => {
    return await this.infoKV.setJSON(id, info);
  };

  updateGroupInfo = async (id: string, info: Partial<IDingInfo>) => {
    return await this.infoKV.updateJSON(id, info);
  };

  getDefaultRepo = async (id: string) => {
    const info = await this.getDingInfo(id);
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

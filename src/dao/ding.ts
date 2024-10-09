import { DingCommon } from './constants';
import { KVManager } from './kv';
import { IDingBotSetting, IDingInfo, IDingUserInfo } from './types';

export class DingDAO {
  secretsKV: KVManager<IDingBotSetting>;
  infoKV: KVManager<IDingInfo>;

  private constructor() {
    this.secretsKV = KVManager.for(DingCommon.SECRETS_PREFIX, 10 * 1000);
    this.infoKV = KVManager.for(DingCommon.INFO_PREFIX, 10 * 1000);
  }

  private static _instance: DingDAO;
  static instance() {
    if (!this._instance) {
      this._instance = new DingDAO();
    }
    return this._instance;
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

export class DingUserKVManager {
  userInfoKV: KVManager<IDingUserInfo>;

  private constructor() {
    this.userInfoKV = KVManager.for(DingCommon.USER_INFO_PREFIX, 30 * 1000);
  }

  private static _instance: DingUserKVManager;
  static instance() {
    if (!this._instance) {
      this._instance = new DingUserKVManager();
    }
    return this._instance;
  }

  async getGitHubUserByDingtalkId(id: string) {
    return (await this.userInfoKV.getJSON(id))?.githubId;
  }

  async updateGitHubUserByDingtalkId(id: string, githubId: string) {
    return await this.userInfoKV.updateJSON(id, { githubId });
  }
}

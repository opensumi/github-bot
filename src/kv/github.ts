import { GitHubCommon, KVManager } from '@/kv';

import { AppSetting, ISetting } from './types';

export class GitHubKVManager {
  appSettingsKV: KVManager<AppSetting>;
  settingsKV: KVManager<ISetting>;

  constructor() {
    this.appSettingsKV = KVManager.for<AppSetting>(
      GitHubCommon.GITHUB_APP_SETTINGS_PREFIX,
    );
    this.settingsKV = KVManager.for<ISetting>(
      GitHubCommon.GITHUB_SETTINGS_PREFIX,
    );
  }

  setAppSettingById(id: string, data: AppSetting) {
    return this.appSettingsKV.setJSON(id, data);
  }

  setSettingById(id: string, data: ISetting) {
    return this.settingsKV.setJSON(id, data);
  }

  getAppSettingById = async (id: string) => {
    return await this.appSettingsKV.getJSON(id);
  };

  getSettingById = async (id: string) => {
    const webhooks = await this.settingsKV.getJSON(id);
    if (webhooks) {
      if (webhooks.contentLimit === undefined) {
        webhooks.contentLimit = 300;
      }
    }

    return webhooks;
  };
}

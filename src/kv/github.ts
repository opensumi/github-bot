// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot

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

  getAppSettingById = async (id: string) => {
    return await this.appSettingsKV.getJSON(id);
  };

  getSettingById = async (id: string) => {
    const webhooks = await this.settingsKV.getJSON(id);
    if (webhooks) {
      if (webhooks.contentLimit === undefined) {
        webhooks.contentLimit = 300;
      }
      if (webhooks.isCommunity === undefined) {
        webhooks.isCommunity = true;
      }
      if (webhooks.notDisplayRepoName === undefined) {
        webhooks.notDisplayRepoName = true;
      }
    }

    return webhooks;
  };
}

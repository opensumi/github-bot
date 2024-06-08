import { GitHubCommon, KVManager } from '@/kv';

import { AppSetting, IGitHubOauthAppConfig, ISetting } from './types';

export class GitHubKVManager {
  appSettingsKV: KVManager<AppSetting>;
  settingsKV: KVManager<ISetting>;
  oauthKV: KVManager<IGitHubOauthAppConfig>;

  private constructor() {
    this.appSettingsKV = KVManager.for<AppSetting>(
      GitHubCommon.GITHUB_APP_SETTINGS_PREFIX,
      60 * 1000,
    );
    this.settingsKV = KVManager.for<ISetting>(
      GitHubCommon.GITHUB_SETTINGS_PREFIX,
      60 * 1000,
    );
    this.oauthKV = KVManager.for<IGitHubOauthAppConfig>(
      GitHubCommon.GITHUB_OAUTH_SETTINGS_PREFIX,
      60 * 1000,
    );
  }

  private static _instance: GitHubKVManager;
  static instance() {
    if (!this._instance) {
      this._instance = new GitHubKVManager();
    }
    return this._instance;
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
        webhooks.contentLimit = 400;
      }
    }

    return webhooks;
  };

  getOauthAppConfig = async (id: string) => {
    return await this.oauthKV.getJSON(id);
  };
}

// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot

import { GitHubCommon, KVManager } from '@/kv';

export interface IDingWebhookItem {
  // Webhook for the dingtalk bot
  url: string;
  // You should select **signed mode(加签模式)** in the security settings of the bot. and you will see this secret.
  secret: string;
  // 该 webhook 仅接收哪些事件的推送
  event?: string[];
}

export interface ISetting {
  /**
   * 在 GitHub 上设置的此 webhook 的验证
   */
  githubSecret: string;
  dingWebhooks: IDingWebhookItem[];
  contentLimit: number;
  /**
   * 开启这个选项会只推送社区需要的那几个 event
   * 因为历史兼容问题，所以默认为 true 了，需要手动关闭
   */
  isCommunity?: boolean;
  isOpenSumiCommunity?: boolean;
  // 监听哪些事件
  event?: string[];
  // 不展示 repo 名字，适合单仓库
  notDisplayRepoName?: boolean;
}

export type AppSetting = ISetting & {
  // GitHub App related
  appSettings: {
    // The appId of your GitHub App.
    appId: string;
    // Generate a private key in GitHub App Settings.
    privateKey: string;
  };
};

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

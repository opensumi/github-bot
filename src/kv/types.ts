export interface IDingWebhookItem {
  /**
   * Webhook for the dingtalk bot
   */
  url: string;
  /**
   * You should select **signed mode(加签模式)** in the security settings of the bot. and you will see this secret.
   */
  secret: string;
  /**
   * 该 webhook 仅接收哪些事件的推送
   */
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
  /**
   * 监听哪些事件
   */
  event?: string[];
  /**
   * 不展示 repo 名字，适合单仓库
   */
  notDisplayRepoName?: boolean;

  installation?: IInstallationSetting;
}

export interface IInstallationSetting {
  flags: Record<string, number>;
}

export type AppSetting = ISetting & {
  /**
   * GitHub App related
   */
  appSettings: {
    /**
     * The appId of your GitHub App.
     */
    appId: string;
    /**
     * Generate a private key in GitHub App Settings.
     * @format textarea
     */
    privateKey: string;
  };
};

export interface IDingBotSetting {
  outGoingToken: string;
}

export interface IDingInfo {
  defaultRepo?: string;
  enableConversation?: boolean;
}

export type SettingType =
  | 'app-settings'
  | 'ding-info'
  | 'ding-setting'
  | 'setting';

export const settingsTypes = [
  'app-settings',
  'ding-info',
  'ding-setting',
  'setting',
] as const;

export interface IAdminInfo {
  token: string;
}

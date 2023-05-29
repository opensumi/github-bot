export interface IDingWebhookItem {
  /**
   * Webhook url
   */
  url: string;
  /**
   * You should select **signed mode(加签模式)** in the security settings of the bot. and you will see the secret.
   */
  secret: string;
  /**
   * 哪些事件需要推送到这个 webhook，如：`release.released`。
   * 不填写则推送所有事件
   */
  event?: string[];
  /**
   * 备注。你可以在这个空里备注下这个 webhook 是属于哪个群的。
   * @format textarea
   */
  remark?: string;
}

export interface ISetting {
  /**
   * 此 webhook 的 secret. 你要在 GitHub 的 webhook 设置里面设置这个 secret
   */
  githubSecret: string;
  /**
   * 需要推送通知的钉钉机器人的 webhook 地址
   */
  dingWebhooks: IDingWebhookItem[];
  /**
   * 通知的内容长度限制，超过这个长度的内容会被截断
   */
  contentLimit: number;
  /**
   * 只推送内置的社区需要的那几个 event，event 列表见：https://github.com/opensumi/github-bot/blob/main/src/github/templates/index.ts#L25
   * @default false
   */
  isCommunity?: boolean;
  /**
   * 监听哪些事件
   */
  event?: string[];
  /**
   * 不在消息中展示 repo 名字，适合单仓库
   * @default false
   */
  notDisplayRepoName?: boolean;
  /**
   * 一般不需要配置这个，仅用于 OpenSumi 社区
   */
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

  /**
   * github id of the user who can release
   */
  userWhoCanRelease?: string[];
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
  /**
   * 各 webhook 配置项的 token
   */
  tokenByScope?: Record<string, string>;
}
